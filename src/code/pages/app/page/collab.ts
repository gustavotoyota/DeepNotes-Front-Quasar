import type { Y } from '@syncedstore/core';
import { WebsocketProvider } from 'src/code/pages/app/page/y-websocket';
import { z } from 'zod';

import { IArrowCollab } from './arrows/arrow';
import { INoteCollab } from './notes/note';
import { AppPage, IPageCollab } from './page';

export interface IAppCollabStore {
  page: IPageCollab;
  notes: { [key: string]: z.output<typeof INoteCollab> };
  arrows: { [key: string]: IArrowCollab };
}

export class PageCollab {
  readonly page: AppPage;

  readonly store: IAppCollabStore;
  readonly doc: Y.Doc;

  websocketProvider!: WebsocketProvider;

  constructor(page: AppPage) {
    this.page = page;

    this.store = syncedstore.SyncedStore({
      page: {},
      notes: {},
      arrows: {},
    }) as IAppCollabStore;

    this.doc = syncedstore.getYjsValue(this.store) as Y.Doc;
  }

  setup() {
    this.websocketProvider = new WebsocketProvider(
      process.env.DEV
        ? 'ws://192.168.1.4:33245'
        : 'wss://yjs-server.deepnotes.app',
      `page:${this.page.id}`,
      this.doc,
      this.page.react.symmetricKey
    );
  }

  reset() {
    this.doc.transact(() => {
      Object.assign(this.store.page, {
        noteIds: [],
        arrowIds: [],

        nextZIndex: 0,
      } as IPageCollab);
    });
  }
}
