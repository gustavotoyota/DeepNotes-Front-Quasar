import { PageArrow } from '../arrows/arrow';
import { PageLayer } from '../layers/layer';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export class PageDeleting {
  constructor(readonly page: AppPage) {}

  perform() {
    if (this.page.react.readonly) {
      return;
    }

    // Root layers will never be deleted this way
    // All container layers will always be deleted
    // Only need to sort the first level elements

    this.page.collab.doc.transact(() => {
      // Delete arrows

      const arrowSet = new Set<PageArrow>(this.page.selection.react.arrows);

      for (const note of this.page.selection.react.notes) {
        for (const arrow of note.incomingArrows) {
          arrowSet.add(arrow);
        }
        for (const arrow of note.outgoingArrows) {
          arrowSet.add(arrow);
        }
        for (const arrow of note.react.arrows) {
          arrowSet.add(arrow);
        }
      }

      const sortedArrows = Array.from(arrowSet).sort(
        (a, b) => b.react.index - a.react.index
      );

      for (const arrow of sortedArrows) {
        arrow.removeFromLayer();

        if (this.page.collab.store.arrows[arrow.id] != null) {
          delete this.page.collab.store.arrows[arrow.id];
        }
      }

      // Delete notes

      const notes = this.page.selection.react.notes.slice();

      notes.sort((a, b) => b.react.index - a.react.index);

      for (const note of notes) {
        this.deleteNote(note);

        note.removeFromLayers();
      }
    });

    this.page.selection.clear();
  }

  deleteLayer(layer: PageLayer) {
    this.page.collab.doc.transact(() => {
      for (const note of layer.react.notes) {
        this.deleteNote(note);
      }

      for (const arrow of layer.react.arrows) {
        if (this.page.collab.store.arrows[arrow.id] != null) {
          delete this.page.collab.store.arrows[arrow.id];
        }
      }

      if (this.page.collab.store.layers[layer.id] != null) {
        delete this.page.collab.store.layers[layer.id];
      }
    });
  }

  deleteNote(note: PageNote) {
    this.page.collab.doc.transact(() => {
      for (const layer of note.react.layers) {
        this.deleteLayer(layer);
      }

      if (this.page.collab.store.notes[note.id] != null) {
        delete this.page.collab.store.notes[note.id];
      }
    });
  }
}
