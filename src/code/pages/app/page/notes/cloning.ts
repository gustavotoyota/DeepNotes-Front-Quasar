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

    // Shift notes before deserialization

    for (const noteIndex of serialObject.layers[0].noteIndexes) {
      const serialNote = serialObject.notes[noteIndex];

      serialNote.pos.x += 8;
      serialNote.pos.y += 8;
    }

    // Deserialize into structure

    let destIndex;
    if (this.page.selection.react.notes.length > 0)
      destIndex = this.page.selection.react.notes.at(-1)!.react.index + 1;

    const destLayer = this.page.activeRegion.react.region.react.activeLayer;

    const { noteIds, arrowIds } = this.page.app.serialization.deserialize(
      serialObject,
      destLayer,
      destIndex
    );

    // Select clones

    const notes = this.page.notes.fromIds(noteIds, destLayer.id);
    const arrows = this.page.arrows.fromIds(arrowIds, destLayer.id);

    this.page.selection.set(...(notes as PageElem[]).concat(arrows));

    // Scroll into view

    if (this.page.selection.react.notes.length > 0) {
      await nextTick();

      const lastSelectedNote = this.page.selection.react.notes.at(-1)!;

      lastSelectedNote.scrollIntoView();
    }
  }
}
