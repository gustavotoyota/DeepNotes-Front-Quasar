import type { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { Vec2 } from 'src/code/pages/static/vec2';
import { computed, reactive, shallowReactive } from 'vue';

import { PageLayer } from '../layers/layer';
import { AppPage } from '../page';
import { INoteCollabOutput, PageNote } from './note';

export class PageNotes {
  readonly react = reactive({
    map: shallowReactive({} as Record<string, PageNote>),

    collab: computed(() => this.page.collab.store.notes),
  });

  constructor(readonly factory: Factory, readonly page: AppPage) {}

  fromId(noteId: string | null): PageNote | null {
    return this.react.map[noteId ?? ''] ?? null;
  }
  fromIds(noteIds: string[]): PageNote[] {
    return noteIds
      .map((noteId) => this.react.map[noteId])
      .filter((note) => note != null);
  }

  createAndObserveChildren(
    noteId: string,
    regionId: string,
    layerId: string,
    index: number
  ): void {
    let note = this.fromId(noteId);

    if (note == null) {
      if (this.react.collab[noteId] == null) {
        return;
      }

      note = this.factory.makeNote(this.page, noteId, regionId, layerId, index);

      this.react.map[note.id] = note;

      this.page.layers.createAndObserveIds(note.react.collab.layerIds, note.id);
    } else {
      if (note.react.parentLayerId != layerId) {
        this.page.selection.remove(note);
      }

      note.react.regionId = regionId;
      note.react.parentLayerId = layerId;
      note.react.index = index;

      note.occurrences[layerId] ??= new Set();
      note.occurrences[layerId].add(index);

      note.react.initialized = false;
    }
  }
  createAndObserveIds(noteIds: string[], regionId: string, layerId: string) {
    for (let index = 0; index < noteIds.length; index++) {
      this.createAndObserveChildren(noteIds[index], regionId, layerId, index);
    }

    (syncedstore.getYjsValue(noteIds) as Y.Array<string>).observe((event) => {
      let index = 0;

      for (const delta of event.changes.delta) {
        if (delta.retain != null) {
          index += delta.retain;
        }

        if (delta.insert != null) {
          for (const noteId of delta.insert) {
            this.createAndObserveChildren(noteId, regionId, layerId, index);
          }
        }
      }
    });
  }

  observeMap() {
    (
      syncedstore.getYjsValue(this.react.collab) as Y.Map<INoteCollabOutput>
    ).observe((event) => {
      for (const [noteId, change] of event.changes.keys) {
        if (change.action === 'delete') {
          delete this.react.map[noteId];
        }
      }
    });
  }

  async create(
    layer: PageLayer,
    worldPos: Vec2,
    centralize = true,
    destIndex?: number
  ) {
    if (this.page.react.readonly) {
      return;
    }

    const noteId = this.page.app.serialization.deserialize(
      $pages.react.defaultNote,
      layer,
      destIndex
    ).noteIds[0];

    const note = this.page.notes.react.map[noteId];

    await this.page.editing.start(note);

    const worldSize = note.getWorldRect('note-frame').size;

    note.react.collab.pos = worldPos;

    if (centralize) {
      note.react.collab.pos = new Vec2(note.react.collab.pos).add(
        worldSize.mul(new Vec2(note.react.collab.anchor).subScalar(0.5))
      );
    }
  }
}
