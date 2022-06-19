import SyncedStore, { enableVueBindings, getYjsValue } from '@syncedstore/core';
import * as Vue from 'vue';

enableVueBindings(Vue);

declare global {
  // eslint-disable-next-line no-var
  var syncedstore: {
    SyncedStore: typeof SyncedStore;
    getYjsValue: typeof getYjsValue;
  };
}

globalThis.syncedstore = {
  SyncedStore,
  getYjsValue,
};
