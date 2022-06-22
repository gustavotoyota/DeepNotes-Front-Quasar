import { Vec2 } from 'src/code/pages/static/vec2';
import { nextTick } from 'vue';

import { AppPage } from '../page';
import { PageNote } from './note';

export class PageDropping {
  constructor(readonly page: AppPage) {}

  async perform(parentNote: PageNote, dropIndex?: number) {
    const containerClientRect = this.page.rects.fromDOM(
      parentNote.react.container.elem.getBoundingClientRect()
    );
    const containerWorldTopLeft = this.page.pos
      .clientToWorld(containerClientRect.topLeft)
      .add(new Vec2(9, 9));

    const selectedNotes = this.page.selection.react.notes.slice();

    selectedNotes.sort(
      (a: PageNote, b: PageNote) => b.react.index - a.react.index
    );

    this.page.collab.doc.transact(() => {
      for (const selectedNote of selectedNotes) {
        selectedNote.collab.pos.x -= containerWorldTopLeft.x;
        selectedNote.collab.pos.y -= containerWorldTopLeft.y;

        selectedNote.moveToRegion(parentNote, dropIndex);
      }
    });

    this.page.activeRegion.react.id = parentNote.id;

    this.page.dragging.cancel();

    await nextTick();

    const lastSelectedNote = this.page.selection.react.notes.at(-1)!;

    lastSelectedNote.scrollIntoView();
  }
}
