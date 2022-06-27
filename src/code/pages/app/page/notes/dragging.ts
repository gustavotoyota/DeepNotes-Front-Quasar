import { listenPointerEvents } from 'src/code/pages/static/dom';
import { Vec2 } from 'src/code/pages/static/vec2';
import { refProp, watchUntilTrue } from 'src/code/pages/static/vue';
import { nextTick, UnwrapRef } from 'vue';

import { AppPage } from '../page';
import { PageNote } from './note';

export interface IDraggingReact {
  active: boolean;

  startPos: Vec2;
  currentPos: Vec2;

  dropRegionId?: string | null;
  dropIndex?: number | null;
}

export class PageDragging {
  static readonly MIN_DISTANCE = 5;

  react: UnwrapRef<IDraggingReact>;

  constructor(readonly page: AppPage) {
    this.react = refProp<IDraggingReact>(this, 'react', {
      active: false,

      startPos: new Vec2(),
      currentPos: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    if (this.page.react.readonly) {
      return;
    }

    // Prevent dragging unmovable notes

    if (
      !(this.page.activeElem.react.elem instanceof PageNote) ||
      !this.page.activeElem.react.elem.react.collab.movable
    ) {
      if (event.pointerType !== 'mouse') {
        this.page.panning.start(event);
      }

      return;
    }

    this.react = {
      active: false,

      startPos: this.page.pos.eventToClient(event),
      currentPos: this.page.pos.eventToClient(event),
    };

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = async (event: PointerEvent) => {
    const clientPos = this.page.pos.eventToClient(event);

    const worldDelta = this.page.sizes.screenToWorld2D(
      clientPos.sub(this.react.currentPos)
    );

    this.react.currentPos = clientPos;

    if (!this.react.active) {
      const gapClientDelta = clientPos.sub(this.react.startPos);

      const gapDist = gapClientDelta.length();

      this.react.active = gapDist >= PageDragging.MIN_DISTANCE;

      if (!this.react.active) {
        return;
      }

      // Update dragging states

      for (const selectedNote of this.page.selection.react.notes) {
        selectedNote.react.dragging = selectedNote.react.collab.movable;

        if (!selectedNote.react.dragging) {
          this.page.selection.remove(selectedNote);
        }
      }

      const gapWorldDelta = this.page.sizes.screenToWorld2D(gapClientDelta);

      this.page.collab.doc.transact(() => {
        for (const selectedNote of this.page.selection.react.notes) {
          selectedNote.react.collab.pos.x += gapWorldDelta.x;
          selectedNote.react.collab.pos.y += gapWorldDelta.y;
        }
      });

      if (this.page.activeRegion.react.id != null) {
        await this._dragOut();
      }

      return;
    }

    // Move selected notes

    this.page.collab.doc.transact(() => {
      for (const note of this.page.selection.react.notes) {
        note.react.collab.pos.x += worldDelta.x;
        note.react.collab.pos.y += worldDelta.y;
      }
    });
  };

  private async _dragOut(): Promise<void> {
    // Store note positions

    const prevCenters = new Map<string, Vec2>();

    for (const selectedNote of this.page.selection.react.notes) {
      prevCenters.set(
        selectedNote.id,
        selectedNote.getWorldRect('note-frame').center
      );
    }

    // Move notes to page region

    const selectedNotes = this.page.selection.react.notes.slice();

    selectedNotes.sort(
      (a: PageNote, b: PageNote) => b.react.index - a.react.index
    );

    const insertIndex =
      this.page.react.currentLayer.react.collab.noteIds.length;

    this.page.collab.doc.transact(() => {
      for (const selectedNote of selectedNotes) {
        selectedNote.moveToRegion(this.page.react.currentLayer, insertIndex);
      }
    });

    // Obtain active region

    const region = this.page.activeRegion.react.region;

    if (!(region instanceof PageNote)) {
      return;
    }

    // Clear active region

    this.page.activeRegion.react.id = null;

    // Adjust note positions and sizes
    // With mouse in the center of the active element

    if (region.react.collab.container.spatial) {
      // Drag out of spatial container

      const containerClientRect = this.page.rects.fromDOM(
        region.react.container.elem.getBoundingClientRect()
      );
      const containerWorldTopLeft = this.page.pos.clientToWorld(
        containerClientRect.topLeft
      );

      this.page.collab.doc.transact(() => {
        for (const selectedNote of this.page.selection.react.notes) {
          selectedNote.react.collab.pos.x += containerWorldTopLeft.x;
          selectedNote.react.collab.pos.y += containerWorldTopLeft.y;
        }
      });
    } else {
      // Drag out of list container

      await nextTick();

      const activeElem = this.page.activeElem.react.elem;

      if (!(activeElem instanceof PageNote)) {
        return;
      }

      this.page.collab.doc.transact(() => {
        for (const selectedNote of this.page.selection.react.notes) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          watchUntilTrue(() => selectedNote.react.loaded).then(() => {
            const worldPos = this.page.pos.clientToWorld(this.react.currentPos);
            const mouseOffset = worldPos.sub(prevCenters.get(activeElem.id)!);

            const prevCenter = prevCenters.get(selectedNote.id)!;

            const worldSize = selectedNote.getWorldRect('note-frame').size;

            selectedNote.react.collab.pos.x =
              prevCenter.x +
              mouseOffset.x +
              worldSize.x * (selectedNote.react.collab.anchor.x - 0.5);
            selectedNote.react.collab.pos.y =
              prevCenter.y +
              mouseOffset.y +
              worldSize.y * (selectedNote.react.collab.anchor.y - 0.5);
          });
        }
      });
    }
  }

  private _finish = () => {
    this.react.active = false;

    for (const selectedNote of this.page.selection.react.notes) {
      selectedNote.react.dragging = false;
    }
  };

  cancel = () => {
    this._finish();

    document.removeEventListener('pointermove', this._update);
    document.removeEventListener('pointerup', this._finish);
  };
}
