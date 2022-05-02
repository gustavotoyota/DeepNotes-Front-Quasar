import 'vue';

import axios, { AxiosInstance } from 'axios';
import { Cookies } from 'quasar';
import { boot } from 'quasar/wrappers';
import { ACCESS_TOKEN, apiBaseURL } from 'src/codes/auth';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: AxiosInstance;
  }
}

declare module 'pinia' {
  interface PiniaCustomProperties {
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

export default boot(({ app, store, ssrContext }) => {
  const api = axios.create({ baseURL: apiBaseURL });

  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

  api.defaults.headers.common.Authorization = `Bearer ${cookies.get(
    ACCESS_TOKEN
  )}`;

  app.config.globalProperties.$api = api;

  store.use(() => ({ $api: api }));
});
