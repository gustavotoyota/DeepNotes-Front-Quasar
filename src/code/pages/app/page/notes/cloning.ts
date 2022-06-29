import { nextTick } from 'vue';

import { PageElem } from '../elems/elem';
import { AppPage } from '../page';

export class PageCloning {
  constructor(readonly page: AppPage) {}

  async perform() {
    if (this.page.react.readonly) {
      return;
    }

    // Serialize selection

    const serialObject = this.page.app.serialization.serialize(
      this.page.selection.react
    );

    // Deserialize into structure

    let destIndex;
    if (this.page.selection.react.notes.length > 0)
      destIndex = this.page.selection.react.notes.at(-1)!.react.index + 1;

    const { noteIds, arrowIds } = this.page.app.serialization.deserialize(
      serialObject,
      this.page.activeRegion.react.region.react.activeLayer,
      destIndex
    );

    // Select and reposition clones

    const notes = this.page.notes.fromIds(noteIds);
    const arrows = this.page.arrows.fromIds(arrowIds);

    this.page.selection.set(...(notes as PageElem[]).concat(arrows));

    this.page.collab.doc.transact(() => {
      for (const note of notes) {
        note.react.collab.pos.x += 8;
        note.react.collab.pos.y += 8;
      }
    });

    // Scroll into view

    if (this.page.selection.react.notes.length > 0) {
      await nextTick();

      const lastSelectedNote = this.page.selection.react.notes.at(-1)!;

      lastSelectedNote.scrollIntoView();
    }
  }
}
