import { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { ComputedRef, reactive, ShallowReactive, UnwrapNestedRefs } from 'vue';

import { AppPage } from '../page';
import { ILayerCollab, PageLayer } from './layer';

export interface ILayersReact {
  map: ShallowReactive<Record<string, PageLayer>>;

  collab: ComputedRef<Record<string, ILayerCollab>>;
}

export class PageLayers {
  readonly react: UnwrapNestedRefs<ILayersReact>;

  constructor(readonly factory: Factory, readonly page: AppPage) {
    this.react = reactive({
      map: {},

      collab: this.page.collab.store.layers,
    });
  }

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
    const collab = this.react.collab[id];

    const layer = this.factory.makeLayer(this.page, id, collab);

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
}
