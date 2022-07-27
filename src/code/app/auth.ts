import sodium from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { internals } from 'src/code/app/internals';
import { privateKey } from 'src/code/lib/crypto/private-key';
import { Auth, useAuth } from 'src/stores/auth';

import { reencryptSessionPrivateKey } from './crypto';

export const apiBaseURL = process.env.DEV
  ? 'http://192.168.1.4:21733'
  : 'https://app-server.deepnotes.app/';

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

export async function tryRefreshTokens(auth: Auth): Promise<void> {
  try {
    if (
      Cookies.get('logged-in') == null ||
      !isTokenValid('refresh-token') ||
      localStorage.getItem('encrypted-private-key') == null
    ) {
      await logout();
      return;
    }

    if (privateKey.valid && !areTokensExpiring()) {
      return;
    }

    const encryptedPrivateKey = sodium.from_base64(
      localStorage.getItem('encrypted-private-key')!
    );

    const response = await internals.api.post<{
      oldSessionKey: string;
      newSessionKey: string;
    }>('/auth/refresh', {});

    // Store token data

    storeTokenExpirations();

    // Reencrypt private key

    reencryptSessionPrivateKey(
      encryptedPrivateKey,
      sodium.from_base64(response.data.oldSessionKey),
      sodium.from_base64(response.data.newSessionKey)
    );

    auth.loggedIn = true;
  } catch (error) {
    console.error(error);
    await logout();
  }
}

export function storeTokenExpirations(): void {
  localStorage.setItem(
    'access-token-expiration',
    (Date.now() + 30 * 60 * 1000).toString()
  );
  localStorage.setItem(
    'refresh-token-expiration',
    (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
  );
}

export async function logout() {
  const auth = useAuth();

  if (!auth.loggedIn) {
    return;
  }

  auth.loggedIn = false;

  // Clear private key

  localStorage.removeItem('encrypted-private-key');

  privateKey.clear();

  // Clear token expirations

  localStorage.removeItem('access-token-expiration');
  localStorage.removeItem('refresh-token-expiration');

  // Clear logged-in cookie

  Cookies.remove('logged-in', {
    domain: process.env.PROD ? '.deepnotes.app' : '192.168.1.4',
    path: '/',
  });

  try {
    await internals.api.post('/auth/logout');
  } catch (error) {
    console.error(error);
  }

  location.href = '/';
}
