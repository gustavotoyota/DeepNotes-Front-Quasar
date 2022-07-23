import '@vue/runtime-core';
import 'pinia';

import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import { apiBaseURL } from 'src/code/app/auth';
import { internals } from 'src/code/app/internals';

declare module 'src/code/app/internals' {
  export interface DeepNotesInternals {
    api: AxiosInstance;
  }
}

declare module 'pinia' {
  interface PiniaCustomProperties {
    api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

export default boot(({ store }) => {
  const api = axios.create({
    withCredentials: true,
    baseURL: apiBaseURL,
  });

  store.use(() => ({ api }));

  if (process.env.CLIENT) {
    internals.api = api;
  }
});
