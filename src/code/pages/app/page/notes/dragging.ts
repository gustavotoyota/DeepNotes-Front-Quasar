import { listenPointerEvents } from 'src/code/pages/static/dom';
import { Vec2 } from 'src/code/pages/static/vec2';
import { refProp } from 'src/code/pages/static/vue';
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

  readonly page: AppPage;

  react: UnwrapRef<IDraggingReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IDraggingReact>(this, 'react', {
      active: false,

      startPos: new Vec2(),
      currentPos: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    // Prevent dragging unmovable notes

    if (
      !(this.page.activeElem.react.elem instanceof PageNote) ||
      !this.page.activeElem.react.elem.collab.movable
    ) {
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

  private _update = async function (this: PageDragging, event: PointerEvent) {
    const clientPos = this.page.pos.eventToClient(event);

    if (!this.react.active) {
      const dist = clientPos.sub(this.react.startPos).length();

      this.react.active = dist >= PageDragging.MIN_DISTANCE;

      if (!this.react.active) {
        return;
      }

      // Update dragging states

      for (const selectedNote of this.page.selection.react.notes) {
        selectedNote.react.dragging = selectedNote.collab.movable;

        if (!selectedNote.react.dragging) {
          this.page.selection.remove(selectedNote);
          continue;
        }
      }

      if (this.page.activeRegion.react.id != null) {
        await this._dragOut(clientPos);
      }
    }

    // Calculate delta

    const delta = clientPos
      .sub(this.react.currentPos)
      .divScalar(this.page.camera.react.zoom);

    // Move selected notes

    this.page.collab.doc.transact(() => {
      for (const note of this.page.selection.react.notes) {
        if (!note.react.dragging) {
          continue;
        }

        note.collab.pos.x += delta.x;
        note.collab.pos.y += delta.y;
      }
    });

    this.react.currentPos = clientPos;
  }.bind(this);

  private async _dragOut(clientPos: Vec2) {
    const worldPos = this.page.pos.clientToWorld(clientPos);

    // Store note positions

    this.page.collab.doc.transact(() => {
      for (const selectedNote of this.page.selection.react.notes) {
        if (!selectedNote.react.dragging) {
          continue;
        }

        const worldRect = selectedNote.getWorldRect('note-frame');

        selectedNote.collab.pos.x =
          worldRect.topLeft.x + worldRect.size.x * selectedNote.collab.anchor.x;
        selectedNote.collab.pos.y =
          worldRect.topLeft.y + worldRect.size.y * selectedNote.collab.anchor.y;
      }
    });

    // Move notes to page region

    const selectedNotes = this.page.selection.react.notes.slice();

    selectedNotes.sort(
      (a: PageNote, b: PageNote) => b.react.index - a.react.index
    );

    this.page.collab.doc.transact(() => {
      for (const selectedNote of selectedNotes) {
        if (!selectedNote.react.dragging) {
          continue;
        }

        selectedNote.removeFromRegion();

        this.page.react.collab.noteIds.push(selectedNote.id);

        selectedNote.react.parentId = null;
      }
    });

    this.page.activeRegion.react.id = null;

    // Adjust note positions and sizes
    // With mouse in the center of the active element

    await nextTick();

    if (!(this.page.activeElem.react.elem instanceof PageNote)) {
      return;
    }

    const activeWorldRect =
      this.page.activeElem.react.elem.getWorldRect('note-frame');

    const mouseOffset = worldPos.sub(activeWorldRect.center);

    this.page.collab.doc.transact(() => {
      for (const selectedNote of this.page.selection.react.notes) {
        selectedNote.collab.pos.x += mouseOffset.x;
        selectedNote.collab.pos.y += mouseOffset.y;
      }
    });
  }

  private _finish = function (this: PageDragging) {
    this.react.active = false;

    for (const selectedNote of this.page.selection.react.notes) {
      selectedNote.react.dragging = false;
    }
  }.bind(this);

  cancel = () => {
    this._finish();

    document.removeEventListener('pointermove', this._update);
    document.removeEventListener('pointerup', this._finish);
  };
}
