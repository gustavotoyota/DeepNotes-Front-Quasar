import { IDBPDatabase, openDB } from 'idb';

let indexedDb: IDBPDatabase;

export async function getIndexedDB() {
  if (indexedDb) {
    return indexedDb;
  }

  indexedDb = await openDB('deepnotes', 1, {
    upgrade(db) {
      db.createObjectStore('crypto');
    },
  });

  return indexedDb;
}

// @ts-ignore
globalThis.getIndexedDB = getIndexedDB;
