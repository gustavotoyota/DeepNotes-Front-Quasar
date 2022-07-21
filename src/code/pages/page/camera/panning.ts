import { listenPointerEvents } from 'src/code/static/dom';
import { Vec2 } from 'src/code/static/vec2';
import { reactive } from 'vue';

import { AppPage } from '../page';

export class PagePanning {
  currentPos: Vec2 = new Vec2();

  readonly react = reactive({
    active: false,
  });

  constructor(readonly page: AppPage) {}

  start(event: PointerEvent) {
    this.currentPos = this.page.pos.eventToClient(event);

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = (event: PointerEvent) => {
    this.react.active = true;

    const clientPos = this.page.pos.eventToClient(event);

    this.page.camera.react.pos = this.page.camera.react.pos.sub(
      clientPos.sub(this.currentPos).divScalar(this.page.camera.react.zoom)
    );

    this.currentPos = clientPos;
  };

  private _finish = () => {
    // setTimeout necessary to prevent middle-click link opening

    setTimeout(() => {
      this.react.active = false;
    }, 0);
  };

  cancel = () => {
    document.removeEventListener('pointermove', this._update);

    this._finish();
  };
}
