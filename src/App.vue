<template>
  <router-view />

  <LoadingOverlay v-if="app.loading" />
</template>

<script lang="ts">
import cookie from 'cookie';
import { setCookie } from 'src/code/app/cookies';
import { getRedirectDest } from 'src/code/app/routing';

export default {
  async preFetch({ ssrContext, store, currentRoute, redirect }) {
    // Check if needs to redirect

    const auth = useAuth(store);

    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

    auth.loggedIn =
      cookies.has('access-token') &&
      cookies.has('refresh-token') &&
      cookies.has('logged-in');

    const redirectDest = getRedirectDest(currentRoute, auth);

    if (redirectDest != null) {
      redirect(redirectDest);
      return;
    }

    // Try refreshing tokens

    if (!auth.loggedIn) {
      return;
    }

    try {
      const response = await auth.api.post<{
        oldSessionKey: string;
        newSessionKey: string;
      }>(
        '/auth/refresh',
        {
          refreshToken: cookies.get('refresh-token'),
        },
        {
          headers: {
            'set-cookie': `refresh-token=${cookies.get('refresh-token')}`,
          },
        }
      );

      auth.oldSessionKey = response.data.oldSessionKey;
      auth.newSessionKey = response.data.newSessionKey;

      const parsedCookies = cookie.parse(
        response.headers['set-cookie'].join(';')
      );

      setCookie(cookies, 'access-token', parsedCookies['access-token']);
      setCookie(cookies, 'refresh-token', parsedCookies['refresh-token']);
      setCookie(cookies, 'logged-in', 'true', { httpOnly: false });

      auth.loggedIn = true;
    } catch (err) {
      console.log(err);

      auth.loggedIn = false;
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
  onResize();

  window.addEventListener('resize', onResize);
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
