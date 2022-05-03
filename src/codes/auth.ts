import './indexed-db';

import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { useAuth } from 'src/stores/auth';

import {
  decryptXChachaPoly1305,
  encryptXChachaPoly1305,
} from './crypto/crypto';
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

export const ACCESS_TOKEN = 'access-token';
export const REFRESH_TOKEN = 'refresh-token';

export function isTokenValid(token: string | null): boolean {
  if (token == null) {
    return false;
  }

  const decodedToken = jwtDecode<{ exp: number }>(token);

  return new Date().getTime() < decodedToken.exp * 1000;
}

export function isTokenExpiring(token: string | null): boolean {
  if (token == null) {
    return false;
  }

  const decodedToken = jwtDecode<{ exp: number; iat: number }>(token);

  const timeToLive = decodedToken.exp * 1000 - decodedToken.iat * 1000;
  const timeDifference = decodedToken.exp * 1000 - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}
export function areTokensExpiring(): boolean {
  return (
    isTokenExpiring(Cookies.get(ACCESS_TOKEN)) ||
    isTokenExpiring(localStorage.getItem(REFRESH_TOKEN))
  );
}

export async function tryRefreshTokens(api: AxiosInstance): Promise<void> {
  const auth = useAuth();

  if (!isTokenValid(localStorage.getItem(REFRESH_TOKEN))) {
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
      refreshToken: localStorage.getItem(REFRESH_TOKEN),
    });

    // Set API authorization header

    api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;

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

    const reencryptedMasterKey = encryptXChachaPoly1305(
      decryptedMasterKey,
      from_base64(response.data.newSessionKey)
    );
    const reencryptedPrivateKey = encryptXChachaPoly1305(
      decryptedPrivateKey,
      from_base64(response.data.newSessionKey)
    );

    // Store tokens and keys

    Cookies.set(ACCESS_TOKEN, response.data.accessToken, {
      sameSite: 'Strict',
      secure: true,
    });
    localStorage.setItem(REFRESH_TOKEN, response.data.refreshToken);

    localStorage.setItem('encrypted-master-key', reencryptedMasterKey);
    localStorage.setItem('encrypted-private-key', reencryptedPrivateKey);

    // Store keys on memory

    masterKey.set(decryptedMasterKey);
    privateKey.set(decryptedPrivateKey);

    auth.loggedIn = true;
  } catch (err) {
    console.log(err);
    auth.logout();
  }
}
