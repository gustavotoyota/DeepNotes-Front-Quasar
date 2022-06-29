import { cloneDeep, merge } from 'lodash';
import { Factory } from 'src/code/pages/static/composition-root';
import { listenPointerEvents } from 'src/code/pages/static/dom';
import { v4 } from 'uuid';
import { reactive } from 'vue';
import * as Y from 'yjs';

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
      null as any,
      null,
      null as any,
      -1,
      reactive(
        IArrowCollab.parse({
          sourceId: v4(),
          targetId: v4(),
        } as IArrowCollabInput)
      )
    );
  }

  start(sourceNote: PageNote, event: PointerEvent) {
    if (this.page.react.readonly) {
      return;
    }

    this.react.active = true;

    const serialArrow = ISerialArrow.parse($pages.react.defaultArrow);
    const arrowCollab = $pages.serialization.deserializeArrow(serialArrow);

    merge(this.fakeArrow.react.collab, arrowCollab);

    this.fakeArrow.react.collab.sourceId = sourceNote.id;
    this.fakeArrow.react.collab.targetId = null as any;

    this.fakeArrow.react.regionId = sourceNote.react.regionId;
    this.fakeArrow.react.layerId = sourceNote.react.layerId;

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
      this.fakeArrow.react.region.react.container.elem != null
    ) {
      this.fakeArrow.react.fakeTargetPos =
        this.fakeArrow.react.fakeTargetPos.sub(
          this.page.pos.clientToWorld(
            this.page.rects.fromDOM(
              this.fakeArrow.react.region.react.container.elem.getBoundingClientRect()
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

    newCollab.label.value = new Y.XmlFragment();

    // Insert arrow into document

    const arrowId = v4();

    this.page.collab.doc.transact(() => {
      this.page.arrows.react.collab[arrowId] = newCollab;

      targetNote.react.layer.react.collab.arrowIds.push(arrowId);
    });

    // Select arrow

    const arrow = this.page.arrows.fromId(arrowId)!;

    this.page.selection.set(arrow);
  }
}
