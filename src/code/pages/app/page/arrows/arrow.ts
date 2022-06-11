import { SyncedText } from '@syncedstore/core';
import { getLineRectIntersection } from 'src/code/pages/static/geometry';
import { Line } from 'src/code/pages/static/line';
import { createSyncedText } from 'src/code/pages/static/synced-store';
import { Vec2 } from 'src/code/pages/static/vec2';
import { computed, ComputedRef, nextTick, UnwrapRef } from 'vue';
import { z } from 'zod';

import { ElemType, IElemReact, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export const IArrowCollab = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),

  label: z
    .any()
    .default(() =>
      createSyncedText([{ insert: '\n' }])
    ) as z.ZodType<SyncedText>,

  head: z.boolean().default(true),
  pattern: z.string().default('solid'),
  tail: z.boolean().default(false),

  color: z.string().default('#b0b0b0'),
});
export type IArrowCollab = z.output<typeof IArrowCollab>;

export interface IArrowReact extends IElemReact {
  fakeTargetPos: Vec2 | null;

  sourceNote: ComputedRef<PageNote>;
  targetNote: ComputedRef<PageNote>;

  targetCenter: ComputedRef<Vec2>;

  sourcePos: ComputedRef<Vec2>;
  targetPos: ComputedRef<Vec2>;
}

export class PageArrow extends PageElem {
  readonly collab: IArrowCollab;

  declare readonly react: UnwrapRef<IArrowReact>;

  constructor(
    page: AppPage,
    id: string,
    parentId: string | null,
    collab: IArrowCollab,
    fake = false
  ) {
    super(page, id, ElemType.ARROW, parentId);

    this.collab = collab;

    const react: Omit<IArrowReact, keyof IElemReact> = {
      fakeTargetPos: fake ? new Vec2() : null,

      sourceNote: computed(
        () => this.page.notes.react.map[this.collab.sourceId]
      ),
      targetNote: computed(
        () => this.page.notes.react.map[this.collab.targetId]
      ),

      targetCenter: computed(() => {
        if (this.react.fakeTargetPos != null) {
          return this.react.fakeTargetPos;
        } else {
          return this.react.targetNote.react.worldCenter;
        }
      }),

      sourcePos: computed(
        () =>
          getLineRectIntersection(
            new Line(
              this.react.targetCenter,
              this.react.sourceNote.react.worldCenter
            ),
            this.react.sourceNote.react.worldRect.grow(12)
          ) ?? this.react.sourceNote.react.worldCenter
      ),
      targetPos: computed(() => {
        if (this.react.fakeTargetPos != null) {
          return this.react.fakeTargetPos;
        }

        return (
          getLineRectIntersection(
            new Line(
              this.react.sourceNote.react.worldCenter,
              this.react.targetCenter
            ),
            this.react.targetNote.react.worldRect.grow(12)
          ) ?? this.react.targetCenter
        );
      }),
    };

    Object.assign(this.react, react);

    if (!fake) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      nextTick(() => {
        if (this.react.sourceNote != null) {
          this.react.sourceNote.outgoingArrows.push(this);
        }

        if (this.react.targetNote != null) {
          this.react.targetNote.incomingArrows.push(this);
        }
      });
    }
  }

  removeFromRegion() {
    this.react.region.react.arrowIds.splice(this.react.index, 1);
  }
}
