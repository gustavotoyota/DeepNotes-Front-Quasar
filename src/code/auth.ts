import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { useAuth } from 'src/stores/auth';

import { reencryptSessionPrivateKey } from './crypto/crypto';
import { privateKey } from './crypto/private-key';
import { addDays } from './utils';

export const apiBaseURL = process.env.DEV
  ? 'http://192.168.1.4:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
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

export async function tryRefreshTokens(): Promise<void> {
  const auth = useAuth();

  try {
    if (
      !isTokenValid('refresh-token') ||
      localStorage.getItem('encrypted-private-key') == null
    ) {
      logout();
      enforceRouteRules();
      return;
    }

    if (privateKey.exists() && !areTokensExpiring()) {
      return;
    }

    const encryptedPrivateKey = from_base64(
      localStorage.getItem('encrypted-private-key')!
    );

    const response = await $api.post<{
      accessToken: string;
      refreshToken: string;

      oldSessionKey: string;
      newSessionKey: string;
    }>(authEndpoints.refresh);

    // Store tokens

    storeTokens(response.data.accessToken, response.data.refreshToken);

    // Reencrypt private key

    reencryptSessionPrivateKey(
      encryptedPrivateKey,
      from_base64(response.data.oldSessionKey),
      from_base64(response.data.newSessionKey)
    );

    auth.loggedIn = true;
  } catch (err) {
    console.error(err);
    logout();
  }

  enforceRouteRules();
}

export function enforceRouteRules() {
  const auth = useAuth();

  if (auth.loggedIn) {
    if (
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register')
    ) {
      location.href = '/';
    }
  } else {
    if (
      location.pathname.startsWith('/pages') ||
      location.pathname.startsWith('/account')
    ) {
      location.href = '/';
    }
  }
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  storeToken('access-token', accessToken);
  storeToken('refresh-token', refreshToken);
}
function storeToken(tokenName: string, token: string) {
  Cookies.set(tokenName, token, {
    path: '/',
    expires: addDays(new Date(), 7),
    secure: !!process.env.PROD,
    sameSite: 'Strict',
    domain: process.env.PROD ? 'deepnotes.app' : '192.168.1.4',
  });

  const decodedToken = jwtDecode<{ exp: number; iat: number }>(token);

  localStorage.setItem(`${tokenName}-iat`, `${decodedToken.iat * 1000}`);
  localStorage.setItem(`${tokenName}-exp`, `${decodedToken.exp * 1000}`);
}

export function deleteTokens() {
  deleteToken('access-token');
  deleteToken('refresh-token');
}
export function deleteToken(tokenName: string) {
  Cookies.remove(tokenName);
  localStorage.removeItem(`${tokenName}-iat`);
  localStorage.removeItem(`${tokenName}-exp`);
}

export function logout() {
  const auth = useAuth();

  // Notify server of logout

  if (auth.loggedIn) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      $api.post(authEndpoints.logout);
    } catch (err) {
      console.error(err);
    }
  }

  // Delete token data

  deleteTokens();

  // Clear e-mail

  localStorage.removeItem('email');

  // Clear private key

  localStorage.removeItem('encrypted-private-key');
  privateKey.clear();

  auth.loggedIn = false;

  enforceRouteRules();
}
