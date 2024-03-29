import type { Y } from '@syncedstore/core';
import { Factory } from 'src/code/app/composition-root';
import { internals } from 'src/code/app/internals';
import { Vec2 } from 'src/code/lib/vec2';
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

  fromId(noteId: string | null, parentLayerId?: string): PageNote | null {
    const note = this.react.map[noteId!];

    if (
      (parentLayerId == null && note != null) ||
      (parentLayerId != null &&
        note?.react.collab.parentLayerId === parentLayerId)
    ) {
      return note;
    } else {
      return null;
    }
  }
  cleanedFromIds(
    noteIds: string[],
    parentLayerId?: string
  ): (PageNote | null)[] {
    const noteIdsSet = new Set<string>();

    const notesArray = [];

    for (const noteId of noteIds) {
      if (noteIdsSet.has(noteId)) {
        continue;
      }

      noteIdsSet.add(noteId);

      notesArray.push(this.fromId(noteId, parentLayerId));
    }

    return notesArray;
  }
  validFromIds(noteIds: string[], parentLayerId?: string): PageNote[] {
    return (this.cleanedFromIds(noteIds, parentLayerId) as PageNote[]).filter(
      (note) => note != null
    );
  }

  createAndObserveChildren(
    noteId: string,
    layerId: string,
    index: number
  ): void {
    let note = this.fromId(noteId);

    if (note == null) {
      if (this.react.collab[noteId] == null) {
        return;
      }

      note = this.factory.makeNote(this.page, noteId, index);

      this.react.map[note.id] = note;

      this.page.layers.createAndObserveIds(note.react.collab.layerIds, note.id);
    } else {
      this.page.selection.remove(note);

      note.react.index = index;

      note.occurrences[layerId] ??= new Set();
      note.occurrences[layerId].add(index);

      note.react.initialized = false;
    }
  }
  createAndObserveIds(noteIds: string[], layerId: string) {
    for (let index = 0; index < noteIds.length; index++) {
      this.createAndObserveChildren(noteIds[index], layerId, index);
    }

    (internals.syncedstore.getYjsValue(noteIds) as Y.Array<string>).observe(
      (event) => {
        let index = 0;

        for (const delta of event.changes.delta) {
          if (delta.retain != null) {
            index += delta.retain;
          }

          if (delta.insert != null) {
            for (const noteId of delta.insert) {
              this.createAndObserveChildren(noteId, layerId, index);
            }
          }
        }
      }
    );
  }

  observeMap() {
    (
      internals.syncedstore.getYjsValue(
        this.react.collab
      ) as Y.Map<INoteCollabOutput>
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
    if (this.page.react.groupReadOnly) {
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
