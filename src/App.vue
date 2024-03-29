<template>
  <router-view />

  <LoadingOverlay v-if="app.loading" />
</template>

<script lang="ts">
import cookie from 'cookie';
import { clearCookie, setCookie } from 'src/code/app/cookies';
import { internals } from 'src/code/app/internals';
import { getRedirectDest } from 'src/code/app/routing';

export default {
  async preFetch({ ssrContext, store, currentRoute, redirect }) {
    // Initialize auth data

    const auth = useAuth(store);

    auth.loggedIn = currentRoute.query.loggedIn === 'true';
    auth.oldSessionKey = currentRoute.query.oldSessionKey as string;
    auth.newSessionKey = currentRoute.query.newSessionKey as string;

    // Try refreshing tokens

    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

    const loggedIn =
      cookies.has('access-token') &&
      cookies.has('refresh-token') &&
      cookies.has('logged-in');

    if (loggedIn && !auth.loggedIn) {
      try {
        const response = await internals.api.post<{
          oldSessionKey: string;
          newSessionKey: string;
        }>(
          '/auth/refresh',
          {},
          {
            headers: {
              cookie: `refresh-token=${cookies.get(
                'refresh-token'
              )}; logged-in=true`,
            },
          }
        );

        const parsedCookies = cookie.parse(
          response.headers['set-cookie'].join(';')
        );

        setCookie(cookies, 'access-token', parsedCookies['access-token']);
        setCookie(cookies, 'refresh-token', parsedCookies['refresh-token']);
        setCookie(cookies, 'logged-in', 'true', { httpOnly: false });

        auth.loggedIn = true;
        auth.oldSessionKey = response.data.oldSessionKey;
        auth.newSessionKey = response.data.newSessionKey;
      } catch (error) {
        console.log(error);

        clearCookie(cookies, 'access-token');
        clearCookie(cookies, 'refresh-token');
        clearCookie(cookies, 'logged-in');

        auth.loggedIn = false;
      }
    }

    // Check if needs to redirect

    const redirectDest = await getRedirectDest(currentRoute, auth, cookies);

    if (redirectDest != null) {
      redirect({
        ...redirectDest,

        query: {
          loggedIn: auth.loggedIn.toString(),
          oldSessionKey: auth.oldSessionKey,
          newSessionKey: auth.newSessionKey,
        },
      });
    }
  },
};
</script>

<script
  setup
  lang="ts"
>
import { Cookies, useMeta } from 'quasar';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { useAuth } from 'src/stores/auth';
import { onBeforeUnmount, onMounted } from 'vue';

import { tryRefreshTokens } from './code/app/auth';
import { useApp } from './stores/app';
import { useUI } from './stores/ui';

const app = useApp();
const ui = useUI();
const auth = useAuth();

useMeta(() => ({
  title: 'DeepNotes',
}));

onMounted(() => {
  setInterval(async () => {
    await tryRefreshTokens(auth);
  }, 10000);

  app.loading = false;
  app.ready.resolve();
});

// Resize

onMounted(() => {
  window.addEventListener('resize', onResize);

  onResize();
});

function onResize() {
  ui.width = window.innerWidth;
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});
</script>

<style>
.q-tooltip {
  font-size: 12px;
}

.q-notifications__list {
  z-index: 2147483647;
}
.q-notification {
  z-index: 2147483647;
}
</style>
