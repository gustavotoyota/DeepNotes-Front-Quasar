import { listenPointerEvents } from 'src/code/lib/dom';
import { Vec2 } from 'src/code/lib/vec2';
import { refProp, watchUntilTrue } from 'src/code/lib/vue';
import { nextTick, UnwrapRef } from 'vue';

import { AppPage } from '../page';
import { PageNote } from './note';

export interface IDraggingReact {
  active: boolean;

  startPos: Vec2;
  currentPos: Vec2;

  dropRegionId?: string;
  dropIndex?: number;
}

export class PageDragging {
  static readonly MIN_DISTANCE = 5;

  react: UnwrapRef<IDraggingReact>;

  sourceRegionId!: string;
  sourceLayerId!: string;

  constructor(readonly page: AppPage) {
    this.react = refProp<IDraggingReact>(this, 'react', {
      active: false,

      startPos: new Vec2(),
      currentPos: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    if (this.page.react.groupReadOnly) {
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

    this.sourceRegionId = this.page.activeElem.react.elem.react.region.id;
    this.sourceLayerId =
      this.page.activeElem.react.elem.react.collab.parentLayerId;

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

      for (const selectedNote of this.page.selection.react.validNotes) {
        selectedNote.react.dragging = selectedNote.react.collab.movable;

        if (!selectedNote.react.dragging) {
          this.page.selection.remove(selectedNote);
        }
      }

      const gapWorldDelta = this.page.sizes.screenToWorld2D(gapClientDelta);

      this.page.collab.doc.transact(() => {
        for (const selectedNote of this.page.selection.react.validNotes) {
          selectedNote.react.collab.pos = new Vec2(
            selectedNote.react.collab.pos
          ).add(gapWorldDelta);
        }
      });

      if (this.page.activeRegion.react.region instanceof PageNote) {
        await this._dragOut();
      }

      return;
    }

    // Move selected notes

    this.page.collab.doc.transact(() => {
      for (const selectedNote of this.page.selection.react.validNotes) {
        selectedNote.react.collab.pos = new Vec2(
          selectedNote.react.collab.pos
        ).add(worldDelta);
      }
    });
  };

  private async _dragOut(): Promise<void> {
    // Store note positions

    const prevCenters = new Map<string, Vec2>();

    for (const selectedNote of this.page.selection.react.validNotes) {
      prevCenters.set(
        selectedNote.id,
        selectedNote.getWorldRect('note-frame').center
      );
    }

    // Move notes to page region

    const oldRegion = this.page.activeRegion.react.region;

    this.page.selection.moveToLayer(this.page.react.activeLayer);

    // Obtain active region

    if (!(oldRegion instanceof PageNote)) {
      return;
    }

    // Adjust note positions and sizes
    // With mouse in the center of the active element

    if (oldRegion.react.collab.container.spatial) {
      // Drag out of spatial container

      const containerClientRect = this.page.rects.fromDOM(
        oldRegion.originElem.getBoundingClientRect()
      );
      const containerWorldTopLeft = this.page.pos.clientToWorld(
        containerClientRect.topLeft
      );

      this.page.collab.doc.transact(() => {
        for (const selectedNote of this.page.selection.react.validNotes) {
          selectedNote.react.collab.pos = new Vec2(
            selectedNote.react.collab.pos
          ).add(containerWorldTopLeft);
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
        for (const selectedNote of this.page.selection.react.validNotes) {
          void watchUntilTrue(() => selectedNote.react.loaded).then(() => {
            const worldPos = this.page.pos.clientToWorld(this.react.currentPos);
            const mouseOffset = worldPos.sub(prevCenters.get(activeElem.id)!);

            const prevCenter = prevCenters.get(selectedNote.id)!;

            const worldSize = selectedNote.getWorldRect('note-frame').size;

            selectedNote.react.collab.pos = prevCenter
              .add(mouseOffset)
              .add(
                worldSize.mul(
                  new Vec2(selectedNote.react.collab.anchor).sub(new Vec2(0.5))
                )
              );
          });
        }
      });
    }
  }

  private _finish = () => {
    this.react.active = false;

    for (const selectedNote of this.page.selection.react.validNotes) {
      selectedNote.react.dragging = false;
    }
  };

  cancel = () => {
    this._finish();

    document.removeEventListener('pointermove', this._update);
    document.removeEventListener('pointerup', this._finish);
  };
}
