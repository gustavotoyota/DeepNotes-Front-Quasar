import syncedStore, { getYjsValue, Y } from '@syncedstore/core';
import { from_base64 } from 'libsodium-wrappers';
import { createSymmetricKey } from 'src/code/crypto/symmetric-key';
import { WebsocketProvider } from 'src/code/pages/static/y-websocket';
import { reactive } from 'vue';
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

    this.store = reactive(
      syncedStore({
        page: {},
        notes: {},
        arrows: {},
      })
    ) as IAppCollabStore;

    this.doc = getYjsValue(this.store) as Y.Doc;
  }

  reset(pageName = '') {
    this.doc.transact(() => {
      Object.assign(this.store.page, {
        name: pageName,

        noteIds: [],
        arrowIds: [],

        nextZIndex: 0,
      } as IPageCollab);
    });
  }

  async preSync() {
    const promises = [];

    const roomName = `page-${this.page.id}-3`;

    // Websocket

    this.websocketProvider = new WebsocketProvider(
      process.env.DEV
        ? 'ws://192.168.1.2:1234'
        : 'wss://yjs-server.deepnotes.app/',
      roomName,
      this.doc,
      createSymmetricKey(
        from_base64('QxC3A22O6JZTE3YQyYmWa6mp4qW6nTRpgqHsXCFC9sA')
      )
    );

    promises.push(
      new Promise((resolve) => this.websocketProvider.on('sync', resolve))
    );

    await Promise.all(promises);
  }
}
