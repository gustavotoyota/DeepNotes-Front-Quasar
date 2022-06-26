import { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { computed, reactive, shallowReactive } from 'vue';
import { z } from 'zod';

import { AppPage } from '../page';
import { ILayerCollab, PageLayer } from './layer';

export class PageLayers {
  readonly react = reactive({
    map: shallowReactive({} as Record<string, PageLayer>),

    collab: computed(() => this.page.collab.store.layers),
  });

  constructor(readonly factory: Factory, readonly page: AppPage) {}

  fromId(id: string | null): PageLayer | null {
    if (id == null) {
      return null;
    }

    return this.react.map[id] ?? null;
  }
  fromIds(ids: string[]): PageLayer[] {
    return ids.map((id) => this.react.map[id]).filter((item) => item != null);
  }

  create(id: string) {
    const layer = this.factory.makeLayer(this.page, id);

    this.react.map[layer.id] = layer;
  }
  createAndObserveIds(ids: string[]) {
    for (const id of ids) {
      this.create(id);
    }

    (syncedstore.getYjsValue(ids) as Y.Array<string>).observe((event) => {
      for (const delta of event.changes.delta) {
        if (delta.insert == null) {
          continue;
        }

        for (const id of delta.insert) {
          this.create(id);
        }
      }
    });
  }

  observeMap() {
    (
      syncedstore.getYjsValue(this.react.collab) as Y.Map<
        z.output<typeof ILayerCollab>
      >
    ).observe((event) => {
      for (const [noteId, change] of event.changes.keys) {
        if (change.action === 'delete') {
          delete this.react.map[noteId];
        }
      }
    });
  }
}
