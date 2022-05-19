/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;

    DEV: string;
    PROD: string;
    DEBUGGING: string;
    CLIENT: string;
    SERVER: string;
    MODE: 'spa' | 'ssr' | 'pwa' | 'bex' | 'cordova' | 'capacitor' | 'electron';
  }
}
