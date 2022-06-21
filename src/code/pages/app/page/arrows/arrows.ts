import type { Y } from '@syncedstore/core';
import { pull } from 'lodash';
import { Factory } from 'src/code/pages/static/composition-root';
import { computed, reactive, shallowReactive } from 'vue';

import { AppPage } from '../page';
import { IArrowCollab, PageArrow } from './arrow';

export class PageArrows {
  readonly react = reactive({
    map: shallowReactive({} as Record<string, PageArrow>),

    collab: computed(() => this.page.collab.store.arrows),
  });

  constructor(readonly factory: Factory, readonly page: AppPage) {}

  fromId(arrowId: string): PageArrow | null {
    return this.react.map[arrowId] ?? null;
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

  create(arrowId: string, layerId: string, parentId: string | null) {
    const collab = this.react.collab[arrowId];

    const arrow = this.factory.makeArrow(
      this.page,
      arrowId,
      layerId,
      parentId,
      collab
    );

    this.react.map[arrow.id] = arrow;
  }
  createAndObserveIds(
    arrowIds: string[],
    layerId: string,
    parentId: string | null
  ) {
    for (const arrowId of arrowIds) {
      this.create(arrowId, layerId, parentId);
    }

    (syncedstore.getYjsValue(arrowIds) as Y.Array<string>).observe((event) => {
      for (const delta of event.changes.delta) {
        if (delta.insert == null) {
          continue;
        }

        for (const arrowId of delta.insert) {
          this.create(arrowId, layerId, parentId);
        }
      }
    });
  }

  observeMap() {
    (syncedstore.getYjsValue(this.react.collab) as Y.Map<IArrowCollab>).observe(
      (event) => {
        for (const [arrowId, change] of event.changes.keys) {
          if (change.action !== 'delete') {
            continue;
          }

          const arrow = this.react.map[arrowId];

          const startNoteId =
            change.oldValue._map.get('sourceId').content.arr[0];

          if (startNoteId != null) {
            const note = this.page.notes.fromId(startNoteId);

            if (note != null) {
              pull(note.outgoingArrows, arrow);
            }
          }

          const endNoteId = change.oldValue._map.get('targetId').content.arr[0];

          if (endNoteId != null) {
            const note = this.page.notes.fromId(endNoteId);

            if (note != null) {
              pull(note.incomingArrows, arrow);
            }
          }

          delete this.react.map[arrowId];
        }
      }
    );
  }
}
