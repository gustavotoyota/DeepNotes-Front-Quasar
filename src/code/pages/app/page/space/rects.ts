import { Rect } from 'src/code/pages/static/rect';
import { Vec2 } from 'src/code/pages/static/vec2';

import { AppPage } from '../page';

export class PageRects {
  constructor(readonly page: AppPage) {}

  get pos() {
    return this.page.pos;
  }

  fromDisplay() {
    const node = document.querySelector('.display');

    if (node == null) {
      throw 'No active display';
    }

    const domClientRect = node.getBoundingClientRect();

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
