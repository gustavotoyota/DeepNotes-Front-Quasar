import { defineStore } from 'pinia';
import { deleteAuthValues } from 'src/codes/auth';
import { masterKey } from 'src/codes/crypto/master-key';
import { privateKey } from 'src/codes/crypto/private-key';

export const useAuth = defineStore('auth', {
  state: () => ({
    loggedIn: false,
  }),

  actions: {
    logout() {
      // Delete auth values

      deleteAuthValues();

      // Clear keys from memory

      masterKey.clear();
      privateKey.clear();

      // Delete API authorization header

      delete this.$api.defaults.headers.common.Authorization;

      this.loggedIn = false;
    },
  },
});
