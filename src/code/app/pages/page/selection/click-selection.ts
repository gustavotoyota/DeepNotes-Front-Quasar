import { PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export class PageClickSelection {
  constructor(readonly page: AppPage) {}

  perform(elem: PageElem, event: PointerEvent) {
    this.page.collab.doc.transact(() => {
      // Container shift-selection

      if (
        elem.react.region instanceof PageNote &&
        event.shiftKey &&
        this.page.activeElem.react.elem instanceof PageNote &&
        elem instanceof PageNote
      ) {
        const fromIndex = this.page.activeElem.react.elem.react.index;
        const toIndex = elem.react.index;

        const step = Math.sign(toIndex - fromIndex);

        for (let i = fromIndex; i !== toIndex; i += step) {
          this.page.selection.add(
            this.page.activeRegion.react.region.react.validNotes[i]
          );
        }
      }

      // Clear selection if not holding Ctrl or Shift
      // And the clicked element is not selected

      if (!event.ctrlKey && !event.shiftKey && !elem.react.selected) {
        this.page.selection.clear(elem.react.region);
      }

      // Remove element if selected and holding Ctrl
      // Else, just change the active element

      if (event.ctrlKey && elem.react.selected) {
        this.page.selection.remove(elem);
      } else {
        this.page.activeElem.set(elem);
      }
    });
  }
}
