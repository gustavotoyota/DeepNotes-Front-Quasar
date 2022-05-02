import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { boot } from 'quasar/wrappers';
import {
  ACCESS_TOKEN_COOKIE,
  authEndpoints,
  REFRESH_TOKEN_COOKIE,
} from 'src/codes/auth';
import {
  decryptXChachaPoly1305,
  encryptXChachaPoly1305,
} from 'src/codes/crypto/crypto';
import { storeMasterKey } from 'src/codes/crypto/master-key';
import { storePrivateKey } from 'src/codes/crypto/private-key';
import { useAuth } from 'src/stores/auth';

function isTokenValid(cookie: string): boolean {
  if (cookie == null) {
    return false;
  }

  const decodedToken = jwtDecode<{ exp: number }>(cookie);

  return new Date().getTime() < decodedToken.exp * 1000;
}
function areTokensValid(cookies: Cookies): boolean {
  return (
    isTokenValid(cookies.get(ACCESS_TOKEN_COOKIE)) &&
    isTokenValid(cookies.get(REFRESH_TOKEN_COOKIE))
  );
}

function isTokenExpiring(cookie: string): boolean {
  if (cookie == null) {
    return false;
  }

  const decodedToken = jwtDecode<{ exp: number; iat: number }>(cookie);

  const timeToLive = decodedToken.exp * 1000 - decodedToken.iat * 1000;
  const timeDifference = decodedToken.exp * 1000 - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}
function areTokensExpiring(cookies: Cookies): boolean {
  return (
    isTokenExpiring(cookies.get(ACCESS_TOKEN_COOKIE)) ||
    isTokenExpiring(cookies.get(REFRESH_TOKEN_COOKIE))
  );
}

async function tryRefreshTokens(
  cookies: Cookies,
  api: AxiosInstance
): Promise<boolean> {
  const auth = useAuth();

  if (!areTokensValid(cookies)) {
    return (auth.loggedIn = false);
  }

  if (!areTokensExpiring(cookies)) {
    return (auth.loggedIn = true);
  }

  const encryptedMasterKey = localStorage.getItem('encrypted-master-key');
  const encryptedPrivateKey = localStorage.getItem('encrypted-private-key');

  if (!encryptedMasterKey || !encryptedPrivateKey) {
    return (auth.loggedIn = false);
  }

  try {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;

      oldSessionKey: string;
      newSessionKey: string;
    }>(authEndpoints.refresh, {
      refreshToken: cookies.get(REFRESH_TOKEN_COOKIE),
    });

    // Set token cookies

    cookies.set(ACCESS_TOKEN_COOKIE, response.data.accessToken);
    cookies.set(REFRESH_TOKEN_COOKIE, response.data.refreshToken);

    // Decrypt keys

    const masterKey = decryptXChachaPoly1305(
      encryptedMasterKey,
      from_base64(response.data.oldSessionKey)
    );
    const privateKey = decryptXChachaPoly1305(
      encryptedPrivateKey,
      from_base64(response.data.newSessionKey)
    );

    // Store keys on memory

    storeMasterKey(masterKey);
    storePrivateKey(privateKey);

    // Reencrypt keys

    const reencryptedMasterKey = encryptXChachaPoly1305(
      masterKey,
      from_base64(response.data.newSessionKey)
    );
    const reencryptedPrivateKey = encryptXChachaPoly1305(
      privateKey,
      from_base64(response.data.newSessionKey)
    );

    // Store keys on local storage

    localStorage.setItem('encrypted-master-key', reencryptedMasterKey);
    localStorage.setItem('encrypted-private-key', reencryptedPrivateKey);

    return (auth.loggedIn = true);
  } catch {
    return (auth.loggedIn = false);
  }
}

export default boot(async ({ app, ssrContext }) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

  const api: AxiosInstance = app.config.globalProperties.$api;

  await tryRefreshTokens(cookies, api);

  if (process.env.CLIENT) {
    setInterval(() => {
      tryRefreshTokens(cookies, api);
    }, 10000);
  }
});
