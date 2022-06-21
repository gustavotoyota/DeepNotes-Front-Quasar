import SyncedStore, { enableVueBindings, getYjsValue } from '@syncedstore/core';
import * as Vue from 'vue';

enableVueBindings(Vue);

const _syncedstore = {
  SyncedStore,
  getYjsValue,
};

declare global {
  // eslint-disable-next-line no-var
  var syncedstore: typeof _syncedstore;
}

globalThis.syncedstore = _syncedstore;
