import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { useAuth } from 'src/stores/auth';

import { decryptXChachaPoly1305, reencryptSecretKeys } from './crypto/crypto';
import { masterKey } from './crypto/master-key';
import { privateKey } from './crypto/private-key';

export const apiBaseURL = process.env.DEV
  ? 'http://localhost:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  login: '/auth/login',
  verify: '/auth/verify',
  refresh: '/auth/refresh',
};

export const redirectBaseURL = process.env.DEV
  ? 'http://localhost:60379'
  : 'https://deepnotes.app';

export const authRedirects = {
  home: `${redirectBaseURL}/`,
  login: `${redirectBaseURL}/login`,
  logout: `${redirectBaseURL}/`,
};

export function isTokenValid(tokenName: string): boolean {
  const exp = parseInt(localStorage.getItem(`${tokenName}-exp`) ?? '');

  if (isNaN(exp)) {
    return false;
  }

  return new Date().getTime() < exp;
}

export function isTokenExpiring(tokenName: string): boolean {
  const exp = parseInt(localStorage.getItem(`${tokenName}-exp`) ?? '');
  const iat = parseInt(localStorage.getItem(`${tokenName}-iat`) ?? '');

  if (isNaN(exp) || isNaN(iat)) {
    return true;
  }

  const timeToLive = exp - iat;
  const timeDifference = exp - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}
export function areTokensExpiring(): boolean {
  return isTokenExpiring('access-token') || isTokenExpiring('refresh-token');
}

export async function tryRefreshTokens(api: AxiosInstance): Promise<void> {
  const auth = useAuth();

  if (!isTokenValid('refresh-token')) {
    auth.logout();
    return;
  }

  if (!areTokensExpiring() && privateKey.exists() && masterKey.exists()) {
    auth.loggedIn = true;
    return;
  }

  const encryptedMasterKey = localStorage.getItem('encrypted-master-key');
  const encryptedPrivateKey = localStorage.getItem('encrypted-private-key');

  if (!encryptedMasterKey || !encryptedPrivateKey) {
    auth.logout();
    return;
  }

  try {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;

      oldSessionKey: string;
      newSessionKey: string;
    }>(authEndpoints.refresh, {
      refreshToken: localStorage.getItem('refresh-token'),
    });

    // Set API authorization header

    api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;

    // Store tokens

    storeAuthValues(response.data.accessToken, response.data.refreshToken);

    // Decrypt keys

    const decryptedMasterKey = decryptXChachaPoly1305(
      encryptedMasterKey,
      from_base64(response.data.oldSessionKey)
    );
    const decryptedPrivateKey = decryptXChachaPoly1305(
      encryptedPrivateKey,
      from_base64(response.data.oldSessionKey)
    );

    // Reencrypt keys

    const { sessionEncryptedMasterKey, sessionEncryptedPrivateKey } =
      reencryptSecretKeys(
        decryptedMasterKey,
        decryptedPrivateKey,
        from_base64(response.data.newSessionKey)
      );

    // Store encrypted keys

    localStorage.setItem('encrypted-master-key', sessionEncryptedMasterKey);
    localStorage.setItem('encrypted-private-key', sessionEncryptedPrivateKey);

    // Store keys on memory

    masterKey.set(decryptedMasterKey);
    privateKey.set(decryptedPrivateKey);

    auth.loggedIn = true;
  } catch (err) {
    console.log(err);
    auth.logout();
  }
}

function storeTokenValues(tokenName: string, token: string) {
  const decodedToken = jwtDecode<{ exp: number; iat: number }>(token);

  localStorage.setItem(`${tokenName}-iat`, `${decodedToken.iat * 1000}`);
  localStorage.setItem(`${tokenName}-exp`, `${decodedToken.exp * 1000}`);
}

export function storeAuthValues(
  accessToken: string,
  refreshToken: string
): void {
  Cookies.set('access-token', accessToken, {
    sameSite: 'Strict',
    secure: true,
    httpOnly: true,
  });
  storeTokenValues('access-token', accessToken);

  localStorage.setItem('refresh-token', refreshToken);
  storeTokenValues('refresh-token', refreshToken);
}

export function deleteAuthValues() {
  Cookies.remove('access-token');
  localStorage.removeItem('access-token-iat');
  localStorage.removeItem('access-token-exp');

  localStorage.removeItem('refresh-token');
  localStorage.removeItem('refresh-token-iat');
  localStorage.removeItem('refresh-token-exp');

  localStorage.removeItem('encrypted-master-key');
  localStorage.removeItem('encrypted-private-key');
}
