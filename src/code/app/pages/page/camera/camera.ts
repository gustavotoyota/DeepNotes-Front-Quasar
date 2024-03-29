import { Vec2 } from 'src/code/lib/vec2';
import { reactive, UnwrapNestedRefs, WatchStopHandle } from 'vue';

import { AppPage } from '../page';
import { IRegionElemsOutput } from '../regions/region';

export interface ICameraReact {
  pos: Vec2;

  zoom: number;
}

export class PageCamera {
  readonly react: UnwrapNestedRefs<ICameraReact>;

  unwatchHandle!: WatchStopHandle;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      pos: new Vec2(),

      zoom: 1,
    });
  }

  destroy() {
    this.unwatchHandle();
  }

  resetZoom() {
    this.react.zoom = 1;
  }

  fitToScreen() {
    let regionElems: IRegionElemsOutput;

    if (this.page.selection.react.validNotes.length > 0) {
      regionElems = this.page.selection.react;
    } else {
      regionElems = this.page.react;
    }

    if (regionElems.validNotes.length === 0) {
      this.react.pos = new Vec2();
      this.resetZoom();
      return;
    }

    const worldRect = this.page.regions.getWorldRect(regionElems);
    const displayRect = this.page.rects.fromDisplay();

    this.react.pos = worldRect.center;

    this.react.zoom = Math.min(
      (Math.min(70, displayRect.size.x / 4) - displayRect.size.x / 2) /
        (worldRect.topLeft.x - this.react.pos.x),
      (Math.min(35, displayRect.size.y / 4) - displayRect.size.y / 2) /
        (worldRect.topLeft.y - this.react.pos.y)
    );

    this.react.zoom = Math.min(this.react.zoom, 1);
  }
}
