import SyncedStore, { enableVueBindings, getYjsValue } from '@syncedstore/core';
import { internals } from 'src/code/app/internals';
import * as Vue from 'vue';

enableVueBindings(Vue);

const syncedstore = {
  SyncedStore,
  getYjsValue,
};

declare module 'src/code/app/internals' {
  export interface DeepNotesInternals {
    syncedstore: typeof syncedstore;
  }
}

internals.syncedstore = syncedstore;
