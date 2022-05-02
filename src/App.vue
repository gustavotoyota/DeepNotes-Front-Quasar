<template>
  <router-view />
</template>

<script
  setup
  lang="ts"
>
import { AxiosInstance } from 'axios';
import { getCurrentInstance, onMounted } from 'vue';

import { tryRefreshTokens } from './stores/auth';

const api = getCurrentInstance()!.appContext.config.globalProperties
  .$api as AxiosInstance;

onMounted(async () => {
  await tryRefreshTokens(api);

  setInterval(() => {
    tryRefreshTokens(api);
  }, 10000);
});
</script>
