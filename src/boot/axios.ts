import '@vue/runtime-core';
import 'pinia';

import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import { apiBaseURL } from 'src/code/auth';

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

declare global {
  // eslint-disable-next-line no-var
  var $api: AxiosInstance;
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

export default boot(({ app, store }) => {
  const api = axios.create({
    withCredentials: true,
    baseURL: apiBaseURL,
  });

  app.config.globalProperties.$api = api;

  store.use(() => ({ $api: api }));

  if (process.env.CLIENT) {
    globalThis.$api = api;
  }
});
