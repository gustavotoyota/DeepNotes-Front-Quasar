import { cloneDeep } from 'lodash';
import { listenPointerEvents } from 'src/code/pages/static/dom';
import { v4 } from 'uuid';
import { reactive } from 'vue';
import * as Y from 'yjs';

import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { IArrowCollab, PageArrow } from './arrow';

export class PageArrowCreation {
  readonly react = reactive({
    active: false,
  });

  readonly fakeArrow: PageArrow;

  constructor(readonly page: AppPage) {
    this.fakeArrow = new PageArrow(
      this.page,
      null as any,
      null as any,
      null,
      -1,
      reactive(
        IArrowCollab.parse({
          sourceId: v4(),
          targetId: v4(),
        } as IArrowCollab)
      ),
      true
    );
  }

  start(sourceNote: PageNote, event: PointerEvent) {
    if (this.page.react.readonly) {
      return;
    }

    this.react.active = true;

    this.fakeArrow.collab.sourceId = sourceNote.id;
    this.fakeArrow.collab.targetId = null as any;

    this.fakeArrow.react.parentId = sourceNote.react.parentId;
    this.fakeArrow.react.fakeTargetPos = this.page.pos.eventToWorld(event);

    listenPointerEvents(event, {
      move: this._update,
      up: () => {
        this.react.active = false;
      },
    });
  }

  private _update = (event: PointerEvent) => {
    this.fakeArrow.react.fakeTargetPos = this.page.pos.eventToWorld(event);
  };

  finish(targetNote: PageNote) {
    this.react.active = false;

    this.fakeArrow.react.fakeTargetPos = null;
    this.fakeArrow.collab.targetId = targetNote.id;

    if (!this.fakeArrow.react.valid) {
      return;
    }

    // Create arrow collab

    const newCollab = cloneDeep(this.fakeArrow.collab);

    newCollab.label.value = new Y.XmlFragment();

    // Insert arrow into document

    const arrowId = v4();

    this.page.collab.doc.transact(() => {
      this.page.arrows.react.collab[arrowId] = newCollab;

      targetNote.react.region.collab.arrowIds.push(arrowId);
    });

    // Select arrow

    const arrow = this.page.arrows.fromId(arrowId)!;

    this.page.selection.set(arrow);
  }
}
