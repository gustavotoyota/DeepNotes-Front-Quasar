<template>
  <router-view />

  <LoadingOverlay v-if="!app.mounted" />
</template>

<script
  setup
  lang="ts"
>
import { onMounted } from 'vue';

import { useAPI } from './boot/external/axios';
import { tryRefreshTokens } from './code/auth';
import LoadingOverlay from './components/misc/LoadingOverlay.vue';
import { useApp } from './stores/app';

const app = useApp();
const api = useAPI();

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens(api);

    setTimeout(tokenRefreshLoop, 10000);
  })();

  app.mounted = true;
});
</script>
