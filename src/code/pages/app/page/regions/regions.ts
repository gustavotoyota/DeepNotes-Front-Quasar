import { Rect } from 'src/code/pages/static/rect';
import { Vec2 } from 'src/code/pages/static/vec2';

import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { IRegionElemsOutput } from './region';

export class PageRegions {
  constructor(readonly page: AppPage) {}

  fromId(regionId: string): AppPage | PageNote {
    const note = this.page.notes.fromId(regionId);

    if (note != null) {
      return note;
    } else {
      return this.page;
    }
  }

  getWorldRect(regionElems: IRegionElemsOutput) {
    const worldRect = new Rect(
      new Vec2(Infinity, Infinity),
      new Vec2(-Infinity, -Infinity)
    );

    if (regionElems.notes.length === 0) {
      return new Rect(this.page.camera.react.pos, this.page.camera.react.pos);
    }

    for (const note of regionElems.notes) {
      worldRect.topLeft.x = Math.min(
        worldRect.topLeft.x,
        note.react.worldRect.topLeft.x
      );
      worldRect.topLeft.y = Math.min(
        worldRect.topLeft.y,
        note.react.worldRect.topLeft.y
      );

      worldRect.bottomRight.x = Math.max(
        worldRect.bottomRight.x,
        note.react.worldRect.bottomRight.x
      );
      worldRect.bottomRight.y = Math.max(
        worldRect.bottomRight.y,
        note.react.worldRect.bottomRight.y
      );
    }

    return worldRect;
  }
}
