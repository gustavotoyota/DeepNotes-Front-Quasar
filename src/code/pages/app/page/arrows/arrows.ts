import type { Y } from '@syncedstore/core';
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

  fromId(arrowId: string | null, parentLayerId?: string): PageArrow | null {
    const arrow = this.react.map[arrowId!];

    if (
      (parentLayerId == null && arrow != null) ||
      (parentLayerId != null &&
        arrow?.react.collab.parentLayerId === parentLayerId)
    ) {
      return arrow;
    } else {
      return null;
    }
  }
  fromIds(arrowIds: string[], parentLayerId?: string): PageArrow[] {
    return arrowIds
      .map((arrowId) => this.fromId(arrowId, parentLayerId) as PageArrow)
      .filter((arrow) => arrow != null);
  }

  create(arrowId: string, index: number) {
    const arrow = this.factory.makeArrow(this.page, arrowId, index);

    this.react.map[arrow.id] = arrow;
  }
  createAndObserveIds(arrowIds: string[]) {
    for (let index = 0; index < arrowIds.length; index++) {
      this.create(arrowIds[index], index);
    }

    (syncedstore.getYjsValue(arrowIds) as Y.Array<string>).observe((event) => {
      let index = 0;

      for (const delta of event.changes.delta) {
        if (delta.retain != null) {
          index += delta.retain;
        }

        if (delta.insert != null) {
          for (const arrowId of delta.insert) {
            this.create(arrowId, index);
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

        // Remove arrow from outgoing arrows

        const sourceNoteId =
          change.oldValue._map.get('sourceId').content.arr[0];

        if (sourceNoteId != null) {
          const note = this.page.notes.fromId(sourceNoteId);

          if (note != null) {
            note.outgoingArrowIds.delete(arrowId);
          }
        }

        // Remove arrow from incoming arrows

        const targetNoteId =
          change.oldValue._map.get('targetId').content.arr[0];

        if (targetNoteId != null) {
          const note = this.page.notes.fromId(targetNoteId);

          if (note != null) {
            note.incomingArrowIds.delete(arrowId);
          }
        }

        // Remove arrow from map

        delete this.react.map[arrowId];
      }
    });
  }
}
