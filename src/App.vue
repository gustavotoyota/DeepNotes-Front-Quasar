<template>
  <router-view />
</template>

<script
  setup
  lang="ts"
>
import { AxiosInstance } from 'axios';
import { getCurrentInstance, onMounted } from 'vue';

import { tryRefreshTokens } from './codes/auth';

const api = getCurrentInstance()!.appContext.config.globalProperties
  .$api as AxiosInstance;

onMounted(async () => {
  (async function tokenRefreshLoop() {
    await tryRefreshTokens(api);

    setTimeout(tokenRefreshLoop, 10000);
  })();
});
</script>
