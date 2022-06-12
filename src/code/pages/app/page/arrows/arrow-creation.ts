import { cloneDeep } from 'lodash';
import { listenPointerEvents } from 'src/code/pages/static/dom';
import { createSyncedText } from 'src/code/pages/static/synced-store';
import { v4 } from 'uuid';
import { reactive } from 'vue';

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
      null,
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
    this.react.active = true;

    this.fakeArrow.collab.sourceId = sourceNote.id;

    this.fakeArrow.collab.targetId = null as any;
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

    if (
      targetNote.id === this.fakeArrow.collab.sourceId ||
      targetNote.react.parentId !==
        this.fakeArrow.react.sourceNote.react.parentId
    ) {
      return;
    }

    const arrowId = v4();

    this.fakeArrow.collab.targetId = targetNote.id;

    const newCollab = cloneDeep(this.fakeArrow.collab);
    newCollab.label = createSyncedText([{ insert: '\n' }]);

    this.page.collab.doc.transact(() => {
      this.page.arrows.react.collab[arrowId] = newCollab;

      this.page.react.collab.arrowIds.push(arrowId);
    });

    this.page.selection.set(this.page.arrows.fromId(arrowId)!);
  }
}
