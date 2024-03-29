import { cloneDeep, merge } from 'lodash';
import { Factory } from 'src/code/app/composition-root';
import { internals } from 'src/code/app/internals';
import { listenPointerEvents } from 'src/code/lib/dom';
import { v4 } from 'uuid';
import { reactive } from 'vue';
import { prosemirrorJSONToYXmlFragment } from 'y-prosemirror';

import { ISerialArrow } from '../../serialization';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { IArrowCollab, IArrowCollabInput, PageArrow } from './arrow';

export class PageArrowCreation {
  readonly react = reactive({
    active: false,
  });

  readonly fakeArrow: PageArrow;

  constructor(factory: Factory, readonly page: AppPage) {
    this.fakeArrow = factory.makeArrow(
      this.page,
      '',
      -1,
      reactive(
        IArrowCollab.parse({
          parentLayerId: v4(),

          sourceId: v4(),
          targetId: v4(),
        } as IArrowCollabInput)
      )
    );
  }

  start(sourceNote: PageNote, event: PointerEvent) {
    if (this.page.react.groupReadOnly) {
      return;
    }

    this.react.active = true;

    const serialArrow = ISerialArrow.parse($pages.react.defaultArrow);
    const arrowCollab = $pages.serialization.deserializeArrow(
      serialArrow,
      v4(),
      new Map([
        [serialArrow.sourceIndex!, v4()],
        [serialArrow.targetIndex!, v4()],
      ])
    );

    merge(this.fakeArrow.react.collab, arrowCollab);

    this.fakeArrow.react.collab.label = serialArrow.label;

    this.fakeArrow.react.collab.sourceId = sourceNote.id;
    this.fakeArrow.react.collab.targetId = null as any;

    this.fakeArrow.react.collab.parentLayerId =
      sourceNote.react.collab.parentLayerId;

    listenPointerEvents(event, {
      move: this._update,
      up: () => {
        this.react.active = false;
      },
    });

    this._update(event);
  }

  private _update = (event: PointerEvent) => {
    this.fakeArrow.react.fakeTargetPos = this.page.pos.eventToWorld(event);

    if (
      this.fakeArrow.react.region instanceof PageNote &&
      this.fakeArrow.react.region.originElem != null
    ) {
      this.fakeArrow.react.fakeTargetPos =
        this.fakeArrow.react.fakeTargetPos.sub(
          this.page.pos.clientToWorld(
            this.page.rects.fromDOM(
              this.fakeArrow.react.region.originElem.getBoundingClientRect()
            ).topLeft
          )
        );
    }
  };

  finish(targetNote: PageNote) {
    this.react.active = false;

    this.fakeArrow.react.fakeTargetPos = null;
    this.fakeArrow.react.collab.targetId = targetNote.id;

    if (!this.fakeArrow.react.valid) {
      return;
    }

    // Create arrow collab

    const newCollab = cloneDeep(this.fakeArrow.react.collab);

    newCollab.label = prosemirrorJSONToYXmlFragment(
      internals.tiptap.arrowSchema,
      this.fakeArrow.react.collab.label
    );

    // Insert arrow into document

    const arrowId = v4();

    this.page.collab.doc.transact(() => {
      this.page.arrows.react.collab[arrowId] = newCollab;

      targetNote.react.parentLayer.react.collab.arrowIds.push(arrowId);
    });

    // Select arrow

    const arrow = this.page.arrows.fromId(arrowId)!;

    this.page.selection.set(arrow);
  }
}
