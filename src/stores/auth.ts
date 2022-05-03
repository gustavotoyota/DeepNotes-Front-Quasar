import { defineStore } from 'pinia';
import { Cookies } from 'quasar';
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'src/codes/auth';
import { masterKey } from 'src/codes/crypto/master-key';
import { privateKey } from 'src/codes/crypto/private-key';

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

      masterKey.clear();
      privateKey.clear();

      // Delete API authorization header

      delete this.$api.defaults.headers.common.Authorization;

      this.loggedIn = false;
    },
  },
});
