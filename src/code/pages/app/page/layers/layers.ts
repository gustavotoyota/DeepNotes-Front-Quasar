import { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { computed, reactive, shallowReactive } from 'vue';

import { AppPage } from '../page';
import { ILayerCollabOutput, PageLayer } from './layer';

export class PageLayers {
  readonly react = reactive({
    map: shallowReactive({} as Record<string, PageLayer>),

    collab: computed(() => this.page.collab.store.layers),
  });

  constructor(readonly factory: Factory, readonly page: AppPage) {}

  fromId(id: string | null): PageLayer | null {
    return this.react.map[id!] ?? null;
  }
  fromIds(ids: string[]): PageLayer[] {
    return ids
      .map((layerId) => this.fromId(layerId) as PageLayer)
      .filter((layer) => layer != null);
  }

  createAndObserveChildren(layerId: string, regionId: string) {
    const layer = this.factory.makeLayer(this.page, layerId, regionId);

    this.react.map[layer.id] = layer;

    this.page.notes.createAndObserveIds(layer.react.collab.noteIds, layer.id);
    this.page.arrows.createAndObserveIds(layer.react.collab.arrowIds);
  }
  createAndObserveIds(layerIds: string[], regionId: string) {
    for (const layerId of layerIds) {
      this.createAndObserveChildren(layerId, regionId);
    }

    (syncedstore.getYjsValue(layerIds) as Y.Array<string>).observe((event) => {
      for (const delta of event.changes.delta) {
        if (delta.insert == null) {
          continue;
        }

        for (const layerId of delta.insert) {
          this.createAndObserveChildren(layerId, regionId);
        }
      }
    });
  }

  observeMap() {
    (
      syncedstore.getYjsValue(this.react.collab) as Y.Map<ILayerCollabOutput>
    ).observe((event) => {
      for (const [noteId, change] of event.changes.keys) {
        if (change.action === 'delete') {
          delete this.react.map[noteId];
        }
      }
    });
  }
}
