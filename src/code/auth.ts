import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { useAuth } from 'src/stores/auth';

import { processSessionPrivateKey } from './crypto/crypto';
import { privateKey } from './crypto/private-key';
import { addDays } from './utils';

export const apiBaseURL = process.env.DEV
  ? 'http://192.168.1.2:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};

export const homeURL = process.env.DEV
  ? 'http://192.168.1.2:60379'
  : 'https://deepnotes.app';

export const pagesURL = process.env.DEV
  ? 'http://192.168.1.2:60379/pages'
  : 'https://deepnotes.app/pages';

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

  if (
    isTokenValid('refresh-token') &&
    !areTokensExpiring() &&
    privateKey.exists()
  ) {
    auth.loggedIn = true;
    return;
  }

  try {
    if (!localStorage.getItem('encrypted-private-key')) {
      return;
    }

    const encryptedPrivateKey = from_base64(
      localStorage.getItem('encrypted-private-key')!
    );

    const response = await api.post<{
      accessToken: string;
      refreshToken: string;

      oldSessionKey: string;
      newSessionKey: string;
    }>(authEndpoints.refresh);

    // Store tokens

    storeTokens(response.data.accessToken, response.data.refreshToken);

    // Reencrypt private key

    processSessionPrivateKey(
      encryptedPrivateKey,
      from_base64(response.data.oldSessionKey),
      from_base64(response.data.newSessionKey)
    );

    auth.loggedIn = true;
  } catch (err) {
    logout(api);
    console.error(err);
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
    secure: process.env.PROD,
    sameSite: 'Strict',
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

export async function logout(api: AxiosInstance) {
  const auth = useAuth();

  if (!localStorage.getItem('encrypted-private-key')) {
    return;
  }

  // Notify server of logout

  if (auth.loggedIn) {
    try {
      await api.post(authEndpoints.logout);
    } catch (err) {
      console.error(err);
    }
  }

  auth.loggedIn = false;

  // Delete token data

  deleteTokens();

  // Clear e-mail

  localStorage.removeItem('email');

  // Clear private key

  localStorage.removeItem('encrypted-private-key');
  privateKey.clear();
}
