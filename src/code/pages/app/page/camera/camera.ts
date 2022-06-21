import { debounce } from 'lodash';
import { Vec2 } from 'src/code/pages/static/vec2';
import {
  computed,
  reactive,
  UnwrapNestedRefs,
  watch,
  watchEffect,
  WritableComputedRef,
} from 'vue';
import { z } from 'zod';

import { AppPage } from '../page';
import { IRegionCollab } from '../regions/region';

export interface ICameraReact {
  pos: Vec2;

  _zoom: number;
  zoom: WritableComputedRef<number>;

  lockPos: boolean;
  lockZoom: boolean;
}

export interface ICameraData {
  pos: { x: number; y: number };
  zoom: number;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  readonly react: UnwrapNestedRefs<ICameraReact>;

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

    watchEffect(() => {
      if (!(this.page.id in __DEEP_NOTES__.pages)) {
        __DEEP_NOTES__.pages[this.page.id] = {};
      }

      __DEEP_NOTES__.pages[this.page.id].zoom = this.react.zoom;
    });
  }

  setup(cameraData: ICameraData) {
    if (cameraData != null) {
      this.react.pos = new Vec2(cameraData.pos);
      this.react._zoom = cameraData.zoom;

      this.react.lockPos = cameraData.lockPos;
      this.react.lockZoom = cameraData.lockZoom;
    } else {
      setTimeout(() => this.fitToScreen(), 0);
    }

    this.watchUpdates();
  }
  watchUpdates() {
    watch(
      () => this.react,
      debounce(async () => {
        console.log('Camera update sent');

        await $api.post('/api/pages/update-camera', {
          pageId: this.page.id,

          camera: this.react,
        });
      }, 2000),
      { deep: true }
    );
  }

  resetZoom() {
    this.react.zoom = 1;
  }

  fitToScreen() {
    let regionCollab: z.output<typeof IRegionCollab>;

    if (this.page.selection.react.notes.length > 0) {
      regionCollab = this.page.selection.react;
    } else {
      regionCollab = this.page.react.currentLayer.collab;
    }

    if (regionCollab.noteIds.length === 0) {
      this.react.pos = new Vec2();
      this.resetZoom();
      return;
    }

    const worldRect = this.page.regions.getWorldRect(regionCollab);

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
