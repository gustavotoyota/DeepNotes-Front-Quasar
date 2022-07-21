import { listenPointerEvents } from 'src/code/static/dom';
import { Vec2 } from 'src/code/static/vec2';
import { computed, ComputedRef, reactive, UnwrapNestedRefs, watch } from 'vue';

import { AppPage } from '../page';

export interface IPinchingReact {
  pointers: Record<string, Vec2>;

  active: ComputedRef<boolean>;
}

export class PagePinching {
  readonly react: UnwrapNestedRefs<IPinchingReact>;

  displayCenterPos!: Vec2;
  displayDistance!: number;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      pointers: {},

      active: computed(() => {
        return Object.keys(this.react.pointers).length >= 2;
      }),
    });

    watch(
      () => this.react.active,
      () => {
        if (this.react.active) {
          this.page.panning.cancel();
          this.page.dragging.cancel();
          this.page.boxSelection.clearTimer();

          const { displayCenterPos, displayDistance } =
            this._getCenterAndDistance();

          this.displayCenterPos = displayCenterPos;
          this.displayDistance = displayDistance;

          document.addEventListener('pointermove', this._update);
        } else {
          document.removeEventListener('pointermove', this._update);
        }
      }
    );
  }

  private _getCenterAndDistance() {
    const pointers = Object.values(this.react.pointers);

    const displayCenterPos = pointers[0].lerp(pointers[1], 0.5);
    const displayDistance = pointers[0].sub(pointers[1]).length();

    return { displayCenterPos, displayDistance };
  }

  addPointer(downEvent: PointerEvent) {
    const updateFunc = (event: PointerEvent) => {
      const displayPos = this.page.pos.eventToDisplay(event);

      this.react.pointers[event.pointerId] = displayPos;
    };

    updateFunc(downEvent);

    listenPointerEvents(downEvent, {
      move: updateFunc,
      up: this.removePointer,
    });
  }
  removePointer = (upEvent: PointerEvent) => {
    delete this.react.pointers[upEvent.pointerId];
  };

  private _update = (event: PointerEvent) => {
    if (!(event.pointerId in this.react.pointers)) {
      return;
    }

    // Compute center and distance

    const { displayCenterPos, displayDistance } = this._getCenterAndDistance();

    // Compute ratio

    const ratio = displayDistance / this.displayDistance;

    // Camera position update

    const centerOffset = this.page.sizes.screenToWorld2D(
      displayCenterPos.sub(this.displayCenterPos)
    );

    const worldCenterPos = this.page.pos.displayToWorld(displayCenterPos);

    this.page.camera.react.pos.x =
      worldCenterPos.x -
      centerOffset.x +
      (this.page.camera.react.pos.x - worldCenterPos.x) / ratio;
    this.page.camera.react.pos.y =
      worldCenterPos.y -
      centerOffset.y +
      (this.page.camera.react.pos.y - worldCenterPos.y) / ratio;

    // Camera zoom update

    this.page.camera.react.zoom = this.page.camera.react.zoom * ratio;

    this.displayCenterPos = displayCenterPos;
    this.displayDistance = displayDistance;
  };
}
