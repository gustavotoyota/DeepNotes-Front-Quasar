import jwtDecode from 'jwt-decode';
import sodium from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { internals } from 'src/code/app/internals';
import { useAuth } from 'src/stores/auth';

import { reencryptSessionPrivateKey } from './crypto/crypto';
import { privateKey } from './crypto/private-key';

export const apiBaseURL = process.env.DEV
  ? 'http://192.168.1.4:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};

export function isTokenValid(tokenName: string): boolean {
  const exp = parseInt(localStorage.getItem(`${tokenName}-expiration`) ?? '');

  if (isNaN(exp)) {
    return false;
  }

  return new Date().getTime() < exp;
}

export function isTokenExpiring(tokenName: string, duration: number): boolean {
  const expiration = parseInt(
    localStorage.getItem(`${tokenName}-expiration`) ?? ''
  );

  if (isNaN(expiration)) {
    return true;
  }

  const timeDifference = expiration - new Date().getTime();
  const timeExpired = duration - timeDifference;

  return timeExpired / duration >= 0.75;
}
export function areTokensExpiring(): boolean {
  return (
    isTokenExpiring('access-token', 30 * 60 * 1000) ||
    isTokenExpiring('refresh-token', 7 * 24 * 60 * 60 * 1000)
  );
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

    if (privateKey.valid && !areTokensExpiring()) {
      return;
    }

    const encryptedPrivateKey = sodium.from_base64(
      localStorage.getItem('encrypted-private-key')!
    );

    const response = await internals.api.post<{
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
      sodium.from_base64(response.data.oldSessionKey),
      sodium.from_base64(response.data.newSessionKey)
    );

    auth.loggedIn = true;

    enforceRouteRules();
  } catch (err) {
    console.error(err);
    logout();
  }
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
  storeToken('refresh-token', refreshToken, { path: '/auth/refresh' });
}
function storeToken(
  tokenName: string,
  token: string,
  options?: { path?: string }
): void {
  options = options ?? {};
  options.path = options.path ?? '/';

  Cookies.set(tokenName, token, {
    path: options.path,
    secure: !!process.env.PROD,
    sameSite: 'Strict',
    domain: process.env.PROD ? 'deepnotes.app' : '192.168.1.4',
  });

  const decodedToken = jwtDecode<{ exp: number; iat: number }>(token);

  localStorage.setItem(`${tokenName}-expiration`, `${decodedToken.exp * 1000}`);
}

export function logout() {
  const auth = useAuth();

  // Notify server of logout

  if (auth.loggedIn) {
    try {
      void internals.api.post(authEndpoints.logout);
    } catch (err) {
      console.error(err);
    }
  }

  // Delete token data

  deleteTokens();

  // Clear private key

  localStorage.removeItem('encrypted-private-key');
  privateKey.clear();

  auth.loggedIn = false;

  enforceRouteRules();
}
export function deleteTokens() {
  deleteToken('access-token');
  deleteToken('refresh-token');
}
export function deleteToken(tokenName: string) {
  Cookies.remove(tokenName);
  localStorage.removeItem(`${tokenName}-expiration`);
}
