import { debounce } from 'lodash';
import { Vec2 } from 'src/code/pages/static/vec2';
import {
  computed,
  reactive,
  UnwrapNestedRefs,
  watch,
  WatchStopHandle,
  WritableComputedRef,
} from 'vue';

import { AppPage } from '../page';
import { IRegionElemsOutput } from '../regions/region';

export interface ICameraReact {
  pos: Vec2;

  _zoom: number;
  zoom: WritableComputedRef<number>;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  readonly react: UnwrapNestedRefs<ICameraReact>;

  unwatchHandle!: WatchStopHandle;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      pos: new Vec2(),

      _zoom: 1,
      zoom: computed({
        get: () => this.react._zoom,
        set: (value) => {
          if (this.react.lockZoom) {
            return;
          }

          this.react._zoom = value;
        },
      }),

      lockPos: false,
      lockZoom: false,
    });
  }

  setup() {
    this.unwatchHandle = watch(
      [() => this.react.lockPos, () => this.react.lockZoom],
      debounce(async () => {
        await $api.post('/api/users/save-camera-settings', {
          lockPos: this.react.lockPos,
          lockZoom: this.react.lockZoom,
        });
      }, 1000)
    );

    this.fitToScreen();
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

    if (!this.react.lockPos) {
      this.react.pos = worldRect.center;
    }

    const displayRect = this.page.rects.fromDisplay();

    this.react.zoom = Math.min(
      (Math.min(70, displayRect.size.x / 4) - displayRect.size.x / 2) /
        (worldRect.topLeft.x - this.react.pos.x),
      (Math.min(35, displayRect.size.y / 4) - displayRect.size.y / 2) /
        (worldRect.topLeft.y - this.react.pos.y)
    );

    this.react.zoom = Math.min(this.react.zoom, 1);
  }
}
