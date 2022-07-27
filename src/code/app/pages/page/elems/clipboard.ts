import { Notify } from 'quasar';
import { getClipboardText, setClipboardText } from 'src/code/lib/clipboard';
import { Vec2 } from 'src/code/lib/vec2';

import { ISerialObject } from '../../serialization';
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

    for (const noteIndex of clipboardRegion.layers[0].noteIndexes) {
      const clipboardNote = clipboardRegion.notes[noteIndex];

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

    try {
      // Get from clipboard

      const clipboardText = text ?? (await getClipboardText());
      const clipboardObjectInput = JSON.parse(clipboardText);
      const clipboardObjectOutput = ISerialObject.parse(clipboardObjectInput);

      // Center notes around destination

      if (this.page.activeRegion.react.region instanceof AppPage) {
        const worldRect = this.page.regions.getWorldRect(
          this.page.selection.react
        );

        const destCenter = worldRect.center.add(new Vec2(8, 8));

        for (const noteIndex of clipboardObjectOutput.layers[0].noteIndexes) {
          const clipboardNote = clipboardObjectOutput.notes[noteIndex];

          clipboardNote.pos.x += destCenter.x;
          clipboardNote.pos.y += destCenter.y;
        }
      }

      // Deserialize into structure

      let destIndex;
      if (this.page.selection.react.validNotes.length > 0) {
        destIndex =
          this.page.selection.react.validNotes.at(-1)!.react.index + 1;
      }

      const destLayer = this.page.activeRegion.react.region.react.activeLayer;

      const { noteIds, arrowIds } = this.page.app.serialization.deserialize(
        clipboardObjectOutput,
        destLayer,
        destIndex
      );

      // Select notes

      const notes = this.page.notes.validFromIds(noteIds, destLayer.id);
      const arrows = this.page.arrows.validFromIds(arrowIds, destLayer.id);

      this.page.selection.set(...(notes as PageElem[]).concat(arrows));
    } catch (error) {
      Notify.create({
        message: 'Failed to paste from clipboard.',
        type: 'negative',
      });

      console.log(error);
    }
  }

  async cut() {
    await this.copy();

    this.page.deleting.perform();
  }
}
