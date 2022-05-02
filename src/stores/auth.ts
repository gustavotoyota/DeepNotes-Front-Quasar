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

      localStorage.removeItem('encrypted-master-key');
      localStorage.removeItem('encrypted-private-key');

      this.loggedIn = false;
    },
  },
});
