import {
  getClipboardText,
  setClipboardText,
} from 'src/code/pages/static/clipboard';
import { Vec2 } from 'src/code/pages/static/vec2';

import { ISerialRegion } from '../../serialization';
import { AppPage } from '../page';
import { PageElem } from './elem';

export class PageClipboard {
  constructor(readonly page: AppPage) {}

  async copy() {
    // Serialize selection

    const clipboardRegion = this.page.app.serialization.serialize(
      this.page.selection.react
    );

    // Subtract center

    const worldRect = this.page.regions.getWorldRect(this.page.selection.react);
    const worldCenter = worldRect.center;

    for (const clipboardNote of clipboardRegion.notes) {
      clipboardNote.pos.x -= worldCenter.x;
      clipboardNote.pos.y -= worldCenter.y;
    }

    // Copy to clipboard

    const clipboardText = JSON.stringify(clipboardRegion, null, 2);

    await setClipboardText(clipboardText);
  }

  async paste(text?: string) {
    if (this.page.react.readonly) {
      return;
    }

    // Get from clipboard

    const clipboardText = text ?? (await getClipboardText());
    let clipboardRegion = JSON.parse(clipboardText);
    clipboardRegion = ISerialRegion.parse(clipboardRegion);

    // Center notes around destination

    if (this.page.activeRegion.react.id == null) {
      const worldRect = this.page.regions.getWorldRect(
        this.page.selection.react
      );

      const destCenter = worldRect.center.add(new Vec2(8, 8));

      for (const clipboardNote of clipboardRegion.notes) {
        clipboardNote.pos.x += destCenter.x;
        clipboardNote.pos.y += destCenter.y;
      }
    }

    // Deserialize into structure

    let destIndex;
    if (this.page.selection.react.notes.length > 0)
      destIndex = this.page.selection.react.notes.at(-1)!.react.index + 1;

    const { noteIds, arrowIds } = this.page.app.serialization.deserialize(
      clipboardRegion,
      this.page.activeRegion.react,
      destIndex
    );

    // Select notes

    const notes = this.page.notes.fromIds(noteIds);
    const arrows = this.page.arrows.fromIds(arrowIds);

    this.page.selection.set(...(notes as PageElem[]).concat(arrows));
  }

  async cut() {
    await this.copy();
    this.page.deleting.perform();
  }
}
