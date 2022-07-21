import type { Y } from '@syncedstore/core';
import { WebsocketProvider } from 'src/code/pages/app/page/y-websocket';
import { internals } from 'src/code/pages/static/internals';
import { v4 } from 'uuid';

import { IArrowCollabOutput } from './arrows/arrow';
import { ILayerCollab, ILayerCollabOutput } from './layers/layer';
import { INoteCollabOutput } from './notes/note';
import { AppPage, IPageCollabOutput } from './page';

export interface IAppCollabStore {
  page: IPageCollabOutput;
  layers: Record<string, ILayerCollabOutput>;
  notes: Record<string, INoteCollabOutput>;
  arrows: Record<string, IArrowCollabOutput>;
}

export class PageCollab {
  readonly store: IAppCollabStore;
  readonly doc: Y.Doc;

  websocketProvider!: WebsocketProvider;

  constructor(readonly page: AppPage) {
    this.store = internals.syncedstore.SyncedStore({
      page: {},
      layers: {},
      notes: {},
      arrows: {},
    }) as IAppCollabStore;

    this.doc = internals.syncedstore.getYjsValue(this.store) as Y.Doc;
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

    await this.websocketProvider.syncPromise;
  }

  reset() {
    const initialLayerId = v4();

    this.page.react.activeLayerId = initialLayerId;

    this.doc.transact(() => {
      // Object.assign because cannot directly assign root elements

      Object.assign(this.store.page, {
        layerIds: [initialLayerId],
      });

      Object.assign(this.store.layers, {
        [initialLayerId]: ILayerCollab.parse({}),
      });
    });
  }
}
