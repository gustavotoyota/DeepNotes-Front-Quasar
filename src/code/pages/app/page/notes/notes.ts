import type { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { Vec2 } from 'src/code/pages/static/vec2';
import { computed, reactive, shallowReactive } from 'vue';
import { z } from 'zod';

import { ITemplate } from '../../templates';
import { AppPage } from '../page';
import { INoteCollab, PageNote } from './note';

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
    layerId: string,
    parentId: string | null
  ): void {
    let note = this.fromId(noteId);

    if (note != null) {
      if (note.react.parentId !== parentId) {
        this.page.selection.remove(note);

        note.removeFromRegion();

        note.react.parentId = parentId;
      }

      return;
    }

    const collab = this.react.collab[noteId];

    if (collab == null) {
      return;
    }

    note = this.factory.makeNote(this.page, noteId, layerId, parentId, collab);

    this.react.map[note.id] = note;

    this.createAndObserveIds(note.collab.noteIds, layerId, note.id);
    this.page.arrows.createAndObserveIds(
      note.collab.arrowIds,
      layerId,
      parentId
    );
  }
  createAndObserveIds(
    noteIds: string[],
    layerId: string,
    parentId: string | null
  ) {
    for (const noteId of noteIds) {
      this.createAndObserveChildren(noteId, layerId, parentId);
    }

    (syncedstore.getYjsValue(noteIds) as Y.Map<string>).observe((event) => {
      for (const delta of event.changes.delta) {
        if (delta.insert != null) {
          for (const noteId of delta.insert) {
            this.createAndObserveChildren(noteId, layerId, parentId);
          }
        }
      }
    });
  }

  observeMap() {
    (
      syncedstore.getYjsValue(this.react.collab) as Y.Map<
        z.output<typeof INoteCollab>
      >
    ).observe((event) => {
      for (const [noteId, change] of event.changes.keys) {
        if (change.action === 'delete') {
          delete this.react.map[noteId];
        }
      }
    });
  }

  async createFromTemplate(template: ITemplate, clientPos: Vec2) {
    if (this.page.react.readonly) {
      return;
    }

    const noteId = this.page.app.serialization.deserialize(
      {
        notes: [template.data],
        arrows: [],
      },
      this.page.react.currentLayer.collab
    ).noteIds[0];

    const note = this.page.notes.react.map[noteId];

    await this.page.editing.start(note);

    const worldSize = note.getWorldRect('note-frame').size;
    const worldPos = this.page.pos.clientToWorld(clientPos);

    note.collab.pos = worldSize
      .mul(new Vec2(note.collab.anchor).subScalar(0.5))
      .add(worldPos);
  }
}
