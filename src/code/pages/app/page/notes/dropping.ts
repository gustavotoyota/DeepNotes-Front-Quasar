import { nextTick } from 'vue';

import { PageLayer } from '../layers/layer';
import { AppPage } from '../page';
import { PageNote } from './note';

export class PageDropping {
  constructor(readonly page: AppPage) {}

  async perform(parentNote: PageNote, dropIndex?: number) {
    // Check drop-back

    let destLayer: PageLayer;

    if (this.page.dragging.sourceRegionId === parentNote.id) {
      destLayer =
        this.page.layers.fromId(this.page.dragging.sourceLayerId) ??
        parentNote.react.activeLayer;
    } else {
      destLayer = parentNote.react.activeLayer;
    }

    const containerClientRect = this.page.rects.fromDOM(
      parentNote.originElem.getBoundingClientRect()
    );
    const containerWorldRect =
      this.page.rects.clientToWorld(containerClientRect);

    this.page.collab.doc.transact(() => {
      for (const selectedNote of this.page.selection.react.notes) {
        selectedNote.react.collab.pos.x -= containerWorldRect.topLeft.x;
        selectedNote.react.collab.pos.y -= containerWorldRect.topLeft.y;
      }
    });

    this.page.selection.moveToLayer(destLayer, dropIndex);

    this.page.dragging.cancel();

    await nextTick();

    const lastSelectedNote = this.page.selection.react.notes.at(-1)!;

    lastSelectedNote.scrollIntoView();
  }
}
