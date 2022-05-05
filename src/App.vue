<template>
  <router-view />

  <LoadingOverlay v-if="!mainStore.mounted" />
</template>

<script
  setup
  lang="ts"
>
import { onMounted } from 'vue';

import { useAPI } from './boot/external/axios';
import { tryRefreshTokens } from './code/auth';
import LoadingOverlay from './components/misc/LoadingOverlay.vue';
import { useMainStore } from './stores/main';

const mainStore = useMainStore();
const api = useAPI();

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens(api);

    setTimeout(tokenRefreshLoop, 10000);
  })();

  mainStore.mounted = true;
});
</script>
