import { Rect } from 'src/code/static/rect';
import { Vec2 } from 'src/code/static/vec2';

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
    const regionWorldRect = new Rect(
      new Vec2(Infinity, Infinity),
      new Vec2(-Infinity, -Infinity)
    );

    if (regionElems.validNotes.length === 0) {
      return new Rect(this.page.camera.react.pos, this.page.camera.react.pos);
    }

    for (const note of regionElems.validNotes) {
      const noteWorldRect = note.getWorldRect('note-frame');

      regionWorldRect.topLeft.x = Math.min(
        regionWorldRect.topLeft.x,
        noteWorldRect.topLeft.x
      );
      regionWorldRect.topLeft.y = Math.min(
        regionWorldRect.topLeft.y,
        noteWorldRect.topLeft.y
      );

      regionWorldRect.bottomRight.x = Math.max(
        regionWorldRect.bottomRight.x,
        noteWorldRect.bottomRight.x
      );
      regionWorldRect.bottomRight.y = Math.max(
        regionWorldRect.bottomRight.y,
        noteWorldRect.bottomRight.y
      );
    }

    return regionWorldRect;
  }
}
