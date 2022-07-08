import type { Y } from '@syncedstore/core';
import { Factory } from 'src/code/pages/static/composition-root';
import { listenPointerEvents } from 'src/code/pages/static/dom';
import { Rect } from 'src/code/pages/static/rect';
import { Vec2 } from 'src/code/pages/static/vec2';
import {
  nextTick,
  reactive,
  ShallowReactive,
  shallowReactive,
  UnwrapNestedRefs,
} from 'vue';
import { yXmlFragmentToProsemirrorJSON } from 'y-prosemirror';

import { AppPage } from '../page';
import { INoteCollabOutput, NoteSection, NoteSide, PageNote } from './note';

export interface IResizingReact {
  active: boolean;

  ghosts: ShallowReactive<Record<string, PageNote>>;
}

export class PageResizing {
  readonly react: UnwrapNestedRefs<IResizingReact>;

  side!: NoteSide;
  section!: NoteSection | null;
  activeGhost!: PageNote;

  oldRects!: Record<
    string,
    {
      frame: Rect;
      area: Rect;
    }
  >;

  constructor(readonly factory: Factory, readonly page: AppPage) {
    this.react = reactive({
      active: false,

      ghosts: shallowReactive({}),
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

    this.react.ghosts = {};

    this.side = side;
    this.section = section ?? null;

    this.oldRects = {};

    this.page.activeElem.set(note);

    let nextZIndex = 0;

    for (const note of this.page.selection.react.notes) {
      this.oldRects[note.id] = this._getNoteRects(note);

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

      collab.width[note.react.sizeProp] = frameRect.size.x.toString();

      if (section != null && collab[section].enabled) {
        const sectionRect = note.getWorldRect(`note-${section}-section`);

        collab[section].height[note.react.sizeProp] =
          sectionRect.size.y.toString();
      }

      collab.zIndex = nextZIndex++;

      const ghost = this.factory.makeNote(
        this.page,
        note.id,
        null as any,
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

      this.react.ghosts[ghost.id] = ghost;
    }

    this.activeGhost.react.collab.zIndex = nextZIndex++;

    await nextTick();

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = (event: PointerEvent) => {
    this.react.active = true;

    const worldPos = this.page.pos.eventToWorld(event);

    const oldActiveRects = this.oldRects[this.activeGhost.id];
    const newActiveAreaRect = new Rect(oldActiveRects.area);

    if (this.side.includes('w')) {
      newActiveAreaRect.topLeft.x = worldPos.x;
    }
    if (this.side.includes('n')) {
      newActiveAreaRect.topLeft.y = worldPos.y;
    }
    if (this.side.includes('e')) {
      newActiveAreaRect.bottomRight.x = worldPos.x;
    }
    if (this.side.includes('s')) {
      newActiveAreaRect.bottomRight.y = worldPos.y;
    }

    if (event.ctrlKey) {
      if (this.side.includes('w')) {
        newActiveAreaRect.bottomRight.x =
          oldActiveRects.area.center.x +
          oldActiveRects.area.center.x -
          worldPos.x;
      }
      if (this.side.includes('n')) {
        newActiveAreaRect.bottomRight.y =
          oldActiveRects.area.center.y +
          oldActiveRects.area.center.y -
          worldPos.y;
      }
      if (this.side.includes('e')) {
        newActiveAreaRect.topLeft.x =
          oldActiveRects.area.center.x +
          oldActiveRects.area.center.x -
          worldPos.x;
      }
      if (this.side.includes('s')) {
        newActiveAreaRect.topLeft.y =
          oldActiveRects.area.center.y +
          oldActiveRects.area.center.y -
          worldPos.y;
      }
    }

    const posDelta = newActiveAreaRect.topLeft.sub(oldActiveRects.area.topLeft);

    for (const ghost of Object.values(this.react.ghosts)) {
      const note = this.page.notes.fromId(ghost.id);

      if (note == null) {
        continue;
      }

      note.react.resizing = true;

      ghost.react.collab.width[ghost.react.sizeProp] =
        newActiveAreaRect.size.x.toString();

      if (this.section != null) {
        ghost.react.collab[this.section].height[ghost.react.sizeProp] =
          newActiveAreaRect.size.y.toString();
      }

      const oldRects = this.oldRects[note.id];

      ghost.react.collab.pos.x = oldRects.frame.topLeft.x + posDelta.x;
      ghost.react.collab.pos.y = oldRects.frame.topLeft.y + posDelta.y;
    }
  };

  private _finish = () => {
    this.page.collab.doc.transact(() => {
      for (const ghost of Object.values(this.react.ghosts)) {
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

  private _getNoteRects(note: PageNote) {
    const frameRect = note.getWorldRect('note-frame');

    let sectionRect = null;
    if (this.section != null && note.react.collab[this.section].enabled) {
      sectionRect = note.getWorldRect(`note-${this.section}-section`);
    }

    return {
      frame: frameRect,
      area: new Rect(
        new Vec2(
          frameRect.topLeft.x,
          sectionRect?.topLeft.y ?? frameRect.topLeft.y
        ),
        new Vec2(
          frameRect.bottomRight.x,
          sectionRect?.bottomRight.y ?? frameRect.bottomRight.y
        )
      ),
    };
  }
}
