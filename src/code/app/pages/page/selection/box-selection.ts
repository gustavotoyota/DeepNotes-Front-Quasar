import { listenPointerEvents } from 'src/code/lib/dom';
import { Rect } from 'src/code/lib/rect';
import { Vec2 } from 'src/code/lib/vec2';
import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IBoxSelectionReact {
  active: boolean;

  regionId?: string;
  region: ComputedRef<AppPage | PageNote>;

  startPos: Vec2;
  endPos: Vec2;
}

export class PageBoxSelection {
  static readonly MIN_DISTANCE = 5;

  readonly react: UnwrapNestedRefs<IBoxSelectionReact>;

  downEvent!: PointerEvent;
  touchTimer: NodeJS.Timeout | null = null;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      active: false,

      region: computed(() => this.page.regions.fromId(this.react.regionId!)),

      startPos: new Vec2(),
      endPos: new Vec2(),
    });
  }

  start(event: PointerEvent, region: AppPage | PageNote) {
    const clientPos = this.page.pos.eventToClient(event);
    const originClientPos = region.originClientPos;
    const offsetPos = clientPos.sub(originClientPos);

    this.react.active = false;

    this.react.regionId = region.id;

    this.react.startPos = new Vec2(offsetPos);
    this.react.endPos = new Vec2(offsetPos);

    this.downEvent = event;

    if (event.pointerType === 'mouse') {
      listenPointerEvents(event, {
        move: this._pointerMove,
        up: this._pointerUp,
      });

      return;
    } else {
      // Only activate box-selection if the touch stays
      // in the same place for 300ms

      this.clearTimer();

      this.touchTimer = setTimeout(() => {
        this.react.active = true;
        this.touchTimer = null;

        listenPointerEvents(event, {
          move: this._pointerMove,
          up: this._pointerUp,
        });
      }, 300);

      listenPointerEvents(event, {
        move: this._timerPointerMove,
        up: this.clearTimer,
      });
    }
  }

  private _pointerMove = (event: PointerEvent) => {
    const clientPos = this.page.pos.eventToClient(event);
    const originClientPos = this.react.region.originClientPos;
    const offsetPos = clientPos.sub(originClientPos);

    if (!this.react.active) {
      const dist = offsetPos.sub(this.react.startPos).length();

      this.react.active = dist >= PageBoxSelection.MIN_DISTANCE;

      if (!this.react.active) {
        return;
      }
    }

    this.react.endPos = new Vec2(offsetPos);
  };

  private _pointerUp = (event: PointerEvent) => {
    if (!this.react.active) {
      return;
    }

    this.react.active = false;

    const topLeft = new Vec2(
      Math.min(this.react.startPos.x, this.react.endPos.x),
      Math.min(this.react.startPos.y, this.react.endPos.y)
    );
    const bottomRight = new Vec2(
      Math.max(this.react.startPos.x, this.react.endPos.x),
      Math.max(this.react.startPos.y, this.react.endPos.y)
    );

    const boxRect = new Rect(topLeft, bottomRight);

    const originClientPos = this.react.region.originClientPos;

    this.page.collab.doc.transact(() => {
      for (const note of this.react.region.react.validNotes) {
        const noteRect = note.getClientRect('note-frame');

        noteRect.topLeft = noteRect.topLeft.sub(originClientPos);
        noteRect.bottomRight = noteRect.bottomRight.sub(originClientPos);

        if (!boxRect.intersectsRect(noteRect)) {
          continue;
        }

        if (note.react.selected && !event.shiftKey) {
          this.page.selection.remove(note);
        } else {
          this.page.selection.add(note);
        }
      }

      for (const arrow of this.react.region.react.validArrows) {
        const arrowClientCenter = this.page.pos.worldToClient(
          arrow.react.centerPos
        );
        const arrowCenter = arrowClientCenter.sub(originClientPos);

        if (!boxRect.containsVec2(arrowCenter)) {
          continue;
        }

        if (arrow.react.selected && !event.shiftKey) {
          this.page.selection.remove(arrow);
        } else {
          this.page.selection.add(arrow);
        }
      }
    });
  };

  private _timerPointerMove = (event: PointerEvent) => {
    if (this.touchTimer == null || this.react.active) {
      return;
    }

    const clientPos = this.page.pos.eventToClient(event);
    const originClientPos = this.react.region.originClientPos;
    const offsetPos = clientPos.sub(originClientPos);

    const dist = offsetPos.sub(this.react.startPos).length();

    if (dist >= PageBoxSelection.MIN_DISTANCE) {
      this.clearTimer();

      this.page.panning.start(this.downEvent);
    }
  };

  clearTimer = () => {
    clearTimeout(this.touchTimer!);

    this.touchTimer = null;
  };
}
