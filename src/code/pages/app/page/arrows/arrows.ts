import type { Y } from '@syncedstore/core';
import { pull } from 'lodash';
import { Factory } from 'src/code/pages/static/composition-root';
import { computed, reactive, shallowReactive } from 'vue';

import { AppPage } from '../page';
import { IArrowCollabOutput, PageArrow } from './arrow';

export class PageArrows {
  readonly react = reactive({
    map: shallowReactive({} as Record<string, PageArrow>),

    collab: computed(() => this.page.collab.store.arrows),
  });

  constructor(readonly factory: Factory, readonly page: AppPage) {}

  fromId(arrowId: string | null): PageArrow | null {
    return this.react.map[arrowId!] ?? null;
  }
  toId(arrow: PageArrow): string {
    return arrow.id;
  }

  fromIds(arrowIds: string[]): PageArrow[] {
    return arrowIds
      .map((arrowId) => this.react.map[arrowId])
      .filter((arrow) => arrow != null);
  }
  toIds(arrows: PageArrow[]): string[] {
    return arrows.map((arrow) => arrow.id);
  }

  create(
    arrowId: string,
    regionId: string | null,
    layerId: string,
    index: number
  ) {
    const arrow = this.factory.makeArrow(
      this.page,
      arrowId,
      regionId,
      layerId,
      index
    );

    arrow.react.parentLayerId = layerId;

    this.react.map[arrow.id] = arrow;
  }
  createAndObserveIds(
    arrowIds: string[],
    regionId: string | null,
    layerId: string
  ) {
    for (let index = 0; index < arrowIds.length; index++) {
      this.create(arrowIds[index], regionId, layerId, index);
    }

    (syncedstore.getYjsValue(arrowIds) as Y.Array<string>).observe((event) => {
      let index = 0;

      for (const delta of event.changes.delta) {
        if (delta.retain != null) {
          index += delta.retain;
        }

        if (delta.insert != null) {
          for (const arrowId of delta.insert) {
            this.create(arrowId, regionId, layerId, index);
          }
        }
      }
    });
  }

  observeMap() {
    (
      syncedstore.getYjsValue(this.react.collab) as Y.Map<IArrowCollabOutput>
    ).observe((event) => {
      for (const [arrowId, change] of event.changes.keys) {
        if (change.action !== 'delete') {
          continue;
        }

        const arrow = this.react.map[arrowId];

        // Remove arrow from outgoing arrows

        const sourceNoteId =
          change.oldValue._map.get('sourceId').content.arr[0];

        if (sourceNoteId != null) {
          const note = this.page.notes.fromId(sourceNoteId);

          if (note != null) {
            pull(note.outgoingArrows, arrow);
          }
        }

        // Remove arrow from incoming arrows

        const targetNoteId =
          change.oldValue._map.get('targetId').content.arr[0];

        if (targetNoteId != null) {
          const note = this.page.notes.fromId(targetNoteId);

          if (note != null) {
            pull(note.incomingArrows, arrow);
          }
        }

        // Remove arrow from map

        delete this.react.map[arrowId];
      }
    });
  }
}
