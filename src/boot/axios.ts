import '@vue/runtime-core';
import 'pinia';

import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import { apiBaseURL } from 'src/code/auth';
import { internals } from 'src/code/static/internals';

declare module 'src/code/static/internals' {
  export interface DeepNotesInternals {
    api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

export default boot(() => {
  const api = axios.create({
    withCredentials: true,
    baseURL: apiBaseURL,
  });

  if (process.env.CLIENT) {
    internals.api = api;
  }
});
