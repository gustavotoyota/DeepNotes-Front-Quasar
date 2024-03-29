import { Rect } from 'src/code/lib/rect';
import { Vec2 } from 'src/code/lib/vec2';

import { AppPage } from '../page';

export class PageRects {
  constructor(readonly page: AppPage) {}

  get pos() {
    return this.page.pos;
  }

  fromDisplay() {
    const elem = document.querySelector('.display-page');

    if (elem == null) {
      throw 'No active display';
    }

    const domClientRect = elem.getBoundingClientRect();

    return this.fromDOM(domClientRect);
  }
  fromDOM(domRect: DOMRect) {
    return new Rect(
      new Vec2(domRect.left, domRect.top),
      new Vec2(domRect.right, domRect.bottom)
    );
  }

  clientToWorld(clientRect: Rect): Rect {
    return new Rect(
      this.pos.clientToWorld(clientRect.topLeft),
      this.pos.clientToWorld(clientRect.bottomRight)
    );
  }
  worldToClient(worldRect: Rect): Rect {
    return new Rect(
      this.pos.worldToClient(worldRect.topLeft),
      this.pos.worldToClient(worldRect.bottomRight)
    );
  }

  displayToWorld(displayRect: Rect): Rect {
    return new Rect(
      this.pos.displayToWorld(displayRect.topLeft),
      this.pos.displayToWorld(displayRect.bottomRight)
    );
  }
  worldToDisplay(worldRect: Rect): Rect {
    return new Rect(
      this.pos.worldToDisplay(worldRect.topLeft),
      this.pos.worldToDisplay(worldRect.bottomRight)
    );
  }

  displayToClient(displayRect: Rect): Rect {
    return new Rect(
      this.pos.displayToClient(displayRect.topLeft),
      this.pos.displayToClient(displayRect.bottomRight)
    );
  }
  clientToDisplay(clientRect: Rect): Rect {
    return new Rect(
      this.pos.clientToDisplay(clientRect.topLeft),
      this.pos.clientToDisplay(clientRect.bottomRight)
    );
  }
}
