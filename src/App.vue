<template>
  <router-view v-if="mounted" />

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import { onMounted, ref } from 'vue';

import { useAPI } from './boot/external/axios';
import { tryRefreshTokens } from './codes/auth';
import LoadingOverlay from './components/misc/LoadingOverlay.vue';

const mounted = ref(false);

const api = useAPI();

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens(api);

    setTimeout(tokenRefreshLoop, 10000);
  })();

  mounted.value = true;
});
</script>
