import SyncedStore, { enableVueBindings, getYjsValue } from '@syncedstore/core';
import { internals } from 'src/code/pages/static/internals';
import * as Vue from 'vue';

enableVueBindings(Vue);

const syncedstore = {
  SyncedStore,
  getYjsValue,
};

declare module 'src/code/pages/static/internals' {
  export interface DeepNotesInternals {
    syncedstore: typeof syncedstore;
  }
}

internals.syncedstore = syncedstore;
