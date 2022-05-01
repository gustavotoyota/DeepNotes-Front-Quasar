import { defineStore } from 'pinia';
import { Cookies } from 'quasar';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from 'src/codes/auth';

export const useAuth = defineStore('auth', {
  state: () => ({
    loggedIn: false,
  }),

  actions: {
    logout() {
      Cookies.remove(ACCESS_TOKEN_COOKIE);
      Cookies.remove(REFRESH_TOKEN_COOKIE);

      this.loggedIn = false;
    },
  },
});
