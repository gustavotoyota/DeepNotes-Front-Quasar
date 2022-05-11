<template>
  <router-view />

  <LoadingOverlay v-if="!home.mounted" />
</template>

<script
  setup
  lang="ts"
>
import { onMounted } from 'vue';

import { useAPI } from './boot/external/axios';
import { tryRefreshTokens } from './code/auth';
import LoadingOverlay from './components/misc/LoadingOverlay.vue';
import { useHome } from './stores/home/home';

const home = useHome();
const api = useAPI();

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens(api);

    setTimeout(tokenRefreshLoop, 10000);
  })();

  home.mounted = true;
});
</script>
