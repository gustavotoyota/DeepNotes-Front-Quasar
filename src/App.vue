<template>
  <router-view />

  <LoadingOverlay v-if="app.loading" />
</template>

<script
  setup
  lang="ts"
>
import { useMeta } from 'quasar';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { useAuth } from 'src/stores/auth';
import { onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { tryRefreshTokens } from './code/app/auth';
import { useApp } from './stores/app';
import { useUI } from './stores/pages/ui';

const app = useApp();

const ui = useUI();

const auth = useAuth();
const route = useRoute();
const router = useRouter();

useMeta(() => ({
  title: 'DeepNotes',
}));

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens(auth, route, router);

    setTimeout(tokenRefreshLoop, 10000);
  })();

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
