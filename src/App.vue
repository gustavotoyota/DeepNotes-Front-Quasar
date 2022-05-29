<template>
  <router-view />

  <LoadingOverlay v-if="!app.mounted" />
</template>

<script
  setup
  lang="ts"
>
import { useMeta } from 'quasar';
import { onMounted } from 'vue';

import { tryRefreshTokens } from './code/auth';
import LoadingOverlay from './components/misc/LoadingOverlay.vue';
import { useApp } from './stores/app';

const app = useApp();

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
