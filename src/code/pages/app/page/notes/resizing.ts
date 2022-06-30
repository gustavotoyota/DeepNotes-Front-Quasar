import type { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { listenPointerEvents } from 'src/code/pages/static/dom';
import { Rect } from 'src/code/pages/static/rect';
import { Vec2 } from 'src/code/pages/static/vec2';
import { refProp } from 'src/code/pages/static/vue';
import {
  nextTick,
  reactive,
  ShallowReactive,
  shallowReactive,
  UnwrapRef,
} from 'vue';
import { yXmlFragmentToProsemirrorJSON } from 'y-prosemirror';

import { AppPage } from '../page';
import { INoteCollabOutput, NoteSection, NoteSide, PageNote } from './note';

export interface IResizingReact {
  active: boolean;

  ghosts: ShallowReactive<PageNote[]>;
}

export class PageResizing {
  react: UnwrapRef<IResizingReact>;

  side!: NoteSide;
  section!: NoteSection | null;
  activeGhost!: PageNote;

  constructor(readonly factory: Factory, readonly page: AppPage) {
    this.react = refProp<IResizingReact>(this, 'react', {
      active: false,

      ghosts: shallowReactive([]),
    });
  }

  async start(
    event: PointerEvent,
    note: PageNote,
    side: NoteSide,
    section?: NoteSection | null
  ) {
    if (this.page.react.readonly) {
      return;
    }

    this.react = {
      active: true,

      ghosts: [],
    };

    this.page.activeElem.set(note);

    this.side = side;
    this.section = section ?? null;

    let nextZIndex = 0;

    for (const note of this.page.selection.react.notes) {
      note.react.resizing = true;

      const collab: INoteCollabOutput = (
        syncedstore.getYjsValue(note.react.collab) as Y.Map<any>
      ).toJSON() as INoteCollabOutput;

      collab.head.value = yXmlFragmentToProsemirrorJSON(
        note.react.collab.head.value
      ) as any;
      collab.body.value = yXmlFragmentToProsemirrorJSON(
        note.react.collab.body.value
      ) as any;

      collab.anchor = new Vec2();

      const frameRect = note.getWorldRect('note-frame');

      collab.pos = frameRect.topLeft;

      collab.width[note.react.sizeProp] = `${frameRect.size.x}px`;

      if (section != null && collab[section].enabled) {
        const sectionRect = note.getWorldRect(`note-${section}-section`);

        collab[section].height[note.react.sizeProp] = `${sectionRect.size.y}px`;
      }

      collab.zIndex = nextZIndex++;

      const ghost = this.factory.makeNote(
        this.page,
        note.id,
        null,
        null as any,
        -1,
        reactive(collab)
      );

      ghost.react.selected = true;
      ghost.react.ghost = true;

      if (this.page.activeElem.is(note.id)) {
        this.activeGhost = ghost;

        ghost.react.active = true;
      }

      this.react.ghosts.push(ghost);
    }

    this.activeGhost.react.collab.zIndex = nextZIndex++;

    await nextTick();

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = (event: PointerEvent) => {
    if (!(this.page.activeElem.react.elem instanceof PageNote)) {
      return;
    }

    const worldPos = this.page.pos.eventToWorld(event);

    const oldSectionRect = this._getSectionRect(
      this.page.activeElem.react.elem
    );

    const newSectionRect = new Rect(oldSectionRect);

    if (this.side.includes('w')) {
      newSectionRect.topLeft.x = worldPos.x;
    }
    if (this.side.includes('n')) {
      newSectionRect.topLeft.y = worldPos.y;
    }
    if (this.side.includes('e')) {
      newSectionRect.bottomRight.x = worldPos.x;
    }
    if (this.side.includes('s')) {
      newSectionRect.bottomRight.y = worldPos.y;
    }

    if (event.ctrlKey) {
      if (this.side.includes('w')) {
        newSectionRect.bottomRight.x =
          oldSectionRect.center.x + oldSectionRect.center.x - worldPos.x;
      }
      if (this.side.includes('n')) {
        newSectionRect.bottomRight.y =
          oldSectionRect.center.y + oldSectionRect.center.y - worldPos.y;
      }
      if (this.side.includes('e')) {
        newSectionRect.topLeft.x =
          oldSectionRect.center.x + oldSectionRect.center.x - worldPos.x;
      }
      if (this.side.includes('s')) {
        newSectionRect.topLeft.y =
          oldSectionRect.center.y + oldSectionRect.center.y - worldPos.y;
      }
    }

    const posDelta = newSectionRect.topLeft.sub(oldSectionRect.topLeft);

    for (const ghost of this.react.ghosts) {
      const note = this.page.notes.fromId(ghost.id);

      if (note == null) {
        continue;
      }

      ghost.react.collab.width[
        ghost.react.sizeProp
      ] = `${newSectionRect.size.x}px`;

      if (this.section != null) {
        ghost.react.collab[this.section].height[
          ghost.react.sizeProp
        ] = `${newSectionRect.size.y}px`;
      }

      const frameRect = note.getWorldRect('note-frame');

      ghost.react.collab.pos.x = frameRect.topLeft.x + posDelta.x;
      ghost.react.collab.pos.y = frameRect.topLeft.y + posDelta.y;
    }
  };

  private _finish = () => {
    this.page.collab.doc.transact(() => {
      for (const ghost of this.react.ghosts) {
        const note = this.page.notes.fromId(ghost.id);

        if (note == null) {
          continue;
        }

        if (this.side.includes('w') || this.side.includes('e')) {
          note.react.collab.width[note.react.sizeProp] =
            ghost.react.collab.width[ghost.react.sizeProp];
        }

        if (
          this.section != null &&
          (this.side.includes('n') || this.side.includes('s'))
        ) {
          note.react.collab[this.section].height[note.react.sizeProp] =
            ghost.react.collab[this.section].height[ghost.react.sizeProp];
        }

        const worldRect = ghost.react.worldRect;

        note.react.collab.pos = worldRect.topLeft.vecLerp(
          worldRect.bottomRight,
          new Vec2(note.react.collab.anchor)
        );

        if (note.react.region instanceof PageNote) {
          const containerClientRect = this.page.rects.fromDOM(
            note.react.region.originElem.getBoundingClientRect()
          );
          const containerWorldTopLeft = this.page.pos.clientToWorld(
            containerClientRect.topLeft
          );

          note.react.collab.pos.x -= containerWorldTopLeft.x;
          note.react.collab.pos.y -= containerWorldTopLeft.y;
        }

        note.react.resizing = false;
      }
    });

    this.react.active = false;
  };

  private _getSectionRect(note: PageNote) {
    const frameRect = note.getWorldRect('note-frame');

    let verticalRect;
    if (this.section != null && note.react.collab[this.section].enabled) {
      verticalRect = note.getWorldRect(`note-${this.section}-section`);
    } else {
      verticalRect = frameRect;
    }

    return new Rect(
      new Vec2(frameRect.topLeft.x, verticalRect.topLeft.y),
      new Vec2(frameRect.bottomRight.x, verticalRect.bottomRight.y)
    );
  }
}
