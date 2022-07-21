import SyncedStore, { enableVueBindings, getYjsValue } from '@syncedstore/core';
import { internals } from 'src/code/static/internals';
import * as Vue from 'vue';

enableVueBindings(Vue);

const syncedstore = {
  SyncedStore,
  getYjsValue,
};

declare module 'src/code/static/internals' {
  export interface DeepNotesInternals {
    syncedstore: typeof syncedstore;
  }
}

internals.syncedstore = syncedstore;
