import { hasVertScrollbar } from 'src/code/pages/static/dom';
import { Vec2 } from 'src/code/pages/static/vec2';

import { AppPage } from '../page';

export class PageZooming {
  constructor(readonly page: AppPage) {}

  perform(event: WheelEvent) {
    // Skip if already handled by a scrollbar

    if (event.altKey) {
      event.preventDefault();
    } else {
      let node = event.target as Node | null;

      while (node != null) {
        if (hasVertScrollbar(node as HTMLElement)) {
          return;
        }

        node = node.parentNode;
      }
    }

    const worldPos = this.page.pos.eventToWorld(event);

    const multiplier = event.deltaY > 0 ? 1 / 1.2 : 1.2;

    // Update camera zoom

    this.page.camera.react.zoom *= multiplier;

    // Update camera position

    this.page.camera.react.pos = worldPos.add(
      this.page.camera.react.pos.sub(worldPos).div(new Vec2(multiplier))
    );
  }
}
