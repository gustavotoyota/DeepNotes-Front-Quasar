import syncedStore, { getYjsValue, Y } from '@syncedstore/core';
import { WebsocketProvider } from 'src/code/pages/app/page/y-websocket';
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
