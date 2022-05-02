import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { defineStore } from 'pinia';
import { Cookies } from 'quasar';
import { ACCESS_TOKEN, authEndpoints, REFRESH_TOKEN } from 'src/codes/auth';
import {
  decryptXChachaPoly1305,
  encryptXChachaPoly1305,
} from 'src/codes/crypto/crypto';
import {
  clearMasterKey,
  masterKey,
  storeMasterKey,
} from 'src/codes/crypto/master-key';
import {
  clearPrivateKey,
  privateKey,
  storePrivateKey,
} from 'src/codes/crypto/private-key';

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

  if (!areTokensExpiring() && privateKey != null && masterKey != null) {
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

    const masterKey = decryptXChachaPoly1305(
      encryptedMasterKey,
      from_base64(response.data.oldSessionKey)
    );
    const privateKey = decryptXChachaPoly1305(
      encryptedPrivateKey,
      from_base64(response.data.oldSessionKey)
    );

    // Reencrypt keys

    const reencryptedMasterKey = encryptXChachaPoly1305(
      masterKey,
      from_base64(response.data.newSessionKey)
    );
    const reencryptedPrivateKey = encryptXChachaPoly1305(
      privateKey,
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

    storeMasterKey(masterKey);
    storePrivateKey(privateKey);

    auth.loggedIn = true;
  } catch (err) {
    console.log(err);
    auth.logout();
    return;
  }
}

export const useAuth = defineStore('auth', {
  state: () => ({
    loggedIn: false,
  }),

  actions: {
    logout() {
      // Remove tokens and keys

      Cookies.remove(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);

      localStorage.removeItem('encrypted-master-key');
      localStorage.removeItem('encrypted-private-key');

      // Clear keys from memory

      clearMasterKey();
      clearPrivateKey();

      // Delete API authorization header

      delete this.$api.defaults.headers.common.Authorization;

      this.loggedIn = false;
    },
  },
});
