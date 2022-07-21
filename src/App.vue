<template>
  <router-view />

  <LoadingOverlay v-if="!app.mounted" />
</template>

<script
  setup
  lang="ts"
>
import { useMeta } from 'quasar';
import { onBeforeUnmount, onMounted } from 'vue';

import { tryRefreshTokens } from './code/auth';
import LoadingOverlay from './components/misc/LoadingOverlay.vue';
import { useApp } from './stores/app';
import { useUI } from './stores/pages/ui';

const app = useApp();

const ui = useUI();

useMeta(() => ({
  title: 'DeepNotes',
}));

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens();

    setTimeout(tokenRefreshLoop, 10000);
  })();

  app.mounted = true;
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
