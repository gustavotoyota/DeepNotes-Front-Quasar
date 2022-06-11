import { listenPointerEvents } from 'src/code/pages/static/dom';
import { Rect } from 'src/code/pages/static/rect';
import { Vec2 } from 'src/code/pages/static/vec2';
import { refProp } from 'src/code/pages/static/vue';
import { UnwrapRef } from 'vue';

import { AppPage } from '../page';

export interface IBoxSelectionReact {
  active: boolean;

  displayStart: Vec2;
  displayEnd: Vec2;
}

export class PageBoxSelection {
  static readonly MIN_DISTANCE = 5;

  readonly page: AppPage;

  react: UnwrapRef<IBoxSelectionReact>;

  downEvent!: PointerEvent;
  touchTimer: NodeJS.Timeout | null = null;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IBoxSelectionReact>(this, 'react', {
      active: false,

      displayStart: new Vec2(),
      displayEnd: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    const displayPos = this.page.pos.eventToDisplay(event);

    this.react = {
      active: false,

      displayStart: new Vec2(displayPos),
      displayEnd: new Vec2(displayPos),
    };

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
    const displayPos = this.page.pos.eventToDisplay(event);

    if (!this.react.active) {
      const dist = displayPos.sub(this.react.displayStart).length();

      this.react.active = dist >= PageBoxSelection.MIN_DISTANCE;

      if (!this.react.active) {
        return;
      }
    }

    this.react.displayEnd = new Vec2(displayPos);
  };

  private _pointerUp = (event: PointerEvent) => {
    this.react.active = false;

    const clientStart = this.page.pos.displayToClient(this.react.displayStart);
    const clientEnd = this.page.pos.displayToClient(this.react.displayEnd);

    const clientTopLeft = new Vec2(
      Math.min(clientStart.x, clientEnd.x),
      Math.min(clientStart.y, clientEnd.y)
    );
    const clientBottomRight = new Vec2(
      Math.max(clientStart.x, clientEnd.x),
      Math.max(clientStart.y, clientEnd.y)
    );

    const clientRect = new Rect(clientTopLeft, clientBottomRight);

    for (const note of this.page.react.notes) {
      if (!clientRect.containsRect(note.react.clientRect)) {
        continue;
      }

      if (note.react.selected && !event.shiftKey) {
        this.page.selection.remove(note);
      } else {
        this.page.selection.add(note);
      }
    }

    for (const arrow of this.page.react.arrows) {
      const clientCenter = this.page.pos.worldToClient(arrow.react.centerPos);

      if (!clientRect.containsVec2(clientCenter)) {
        continue;
      }

      if (arrow.react.selected && !event.shiftKey) {
        this.page.selection.remove(arrow);
      } else {
        this.page.selection.add(arrow);
      }
    }
  };

  private _timerPointerMove = (event: PointerEvent) => {
    if (this.touchTimer == null || this.react.active) {
      return;
    }

    const displayPos = this.page.pos.eventToDisplay(event);

    const dist = displayPos.sub(this.react.displayStart).length();

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
