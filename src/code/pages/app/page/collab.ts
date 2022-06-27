import type { Y } from '@syncedstore/core';
import { WebsocketProvider } from 'src/code/pages/app/page/y-websocket';
import { v4 } from 'uuid';
import { z } from 'zod';

import { IArrowCollab } from './arrows/arrow';
import { ILayerCollab } from './layers/layer';
import { INoteCollab } from './notes/note';
import { AppPage, IPageCollab } from './page';

export interface IAppCollabStore {
  page: IPageCollab;
  layers: Record<string, ILayerCollab>;
  notes: Record<string, z.output<typeof INoteCollab>>;
  arrows: Record<string, z.output<typeof IArrowCollab>>;
}

export class PageCollab {
  readonly store: IAppCollabStore;
  readonly doc: Y.Doc;

  websocketProvider!: WebsocketProvider;

  constructor(readonly page: AppPage) {
    this.store = syncedstore.SyncedStore({
      page: {},
      layers: {},
      notes: {},
      arrows: {},
    }) as IAppCollabStore;

    this.doc = syncedstore.getYjsValue(this.store) as Y.Doc;
  }

  async synchronize() {
    this.websocketProvider = new WebsocketProvider(
      process.env.DEV
        ? 'ws://192.168.1.4:33245'
        : 'wss://yjs-server.deepnotes.app',
      `page:${this.page.id}`,
      this.doc,
      this.page.react.symmetricKey
    );

    await this.websocketProvider.syncedPromise;
  }

  reset() {
    const initialLayerId = v4();

    this.page.react.currentLayerId = initialLayerId;

    this.doc.transact(() => {
      // Object.assign because cannot directly assign root elements

      Object.assign(this.store.page, {
        layerIds: [initialLayerId],
      });

      Object.assign(this.store.layers, {
        [initialLayerId]: {
          name: 'Default layer',

          noteIds: [],
          arrowIds: [],

          nextZIndex: 0,
        } as ILayerCollab,
      });
    });
  }
}
