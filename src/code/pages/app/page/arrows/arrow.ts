import Color from 'color';
import { getLineRectIntersection } from 'src/code/pages/static/geometry';
import { Line } from 'src/code/pages/static/line';
import { Vec2 } from 'src/code/pages/static/vec2';
import { lightenByRatio } from 'src/code/utils';
import { computed, ComputedRef, nextTick, UnwrapNestedRefs } from 'vue';
import * as Y from 'yjs';
import { z } from 'zod';

import { ElemType, IElemReact, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export const IArrowCollab = z.object({
  sourceId: z.string().uuid().optional(),
  targetId: z.string().uuid().optional(),

  label: z
    .object({
      enabled: z.boolean().default(false),
      value: z
        .any()
        .default(() => new Y.XmlFragment()) as z.ZodType<Y.XmlFragment>,
    })
    .default({ value: undefined as any }),

  backward: z.boolean().default(false),
  forward: z.boolean().default(true),

  dashed: z.boolean().default(false),

  color: z.string().default('#b0b0b0'),
});

export interface IArrowReact extends IElemReact {
  fakeTargetPos: Vec2 | null;

  valid: ComputedRef<boolean>;

  sourceNote: ComputedRef<PageNote>;
  targetNote: ComputedRef<PageNote>;

  sourceCenter: ComputedRef<Vec2>;
  targetCenter: ComputedRef<Vec2>;

  sourcePos: ComputedRef<Vec2>;
  targetPos: ComputedRef<Vec2>;

  centerPos: ComputedRef<Vec2>;

  angle: ComputedRef<number>;

  color: {
    highlight: ComputedRef<string>;
    light: ComputedRef<string>;
    final: ComputedRef<string>;
  };
}

export class PageArrow extends PageElem {
  static readonly ARROW_SIZE = 10;

  declare readonly react: UnwrapNestedRefs<IArrowReact>;

  constructor(
    page: AppPage,
    id: string,
    layerId: string,
    parentId: string | null,
    index: number,
    readonly collab: z.output<typeof IArrowCollab>,
    fake = false
  ) {
    super(page, id, ElemType.ARROW, layerId, parentId, index);

    this.collab = collab;

    const react: Omit<IArrowReact, keyof IElemReact> = {
      fakeTargetPos: fake ? new Vec2() : null,

      valid: computed(() => {
        if (this.react.sourceNote == null) {
          return false;
        }

        if (this.react.fakeTargetPos != null) {
          return true;
        }

        if (this.react.targetNote == null) {
          return false;
        }

        return (
          this.react.sourceNote.react.parent === this.react.parent &&
          this.react.targetNote.react.parent === this.react.parent
        );
      }),

      sourceNote: computed(
        () => this.page.notes.react.map[this.collab.sourceId!]
      ),
      targetNote: computed(
        () => this.page.notes.react.map[this.collab.targetId!]
      ),

      sourceCenter: computed(() => this.react.sourceNote.react.worldCenter),
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
            new Line(this.react.targetCenter, this.react.sourceCenter),
            this.react.sourceNote.react.worldRect.grow(16)
          ) ?? this.react.sourceCenter
      ),
      targetPos: computed(() => {
        if (this.react.fakeTargetPos != null) {
          return this.react.fakeTargetPos;
        }

        return (
          getLineRectIntersection(
            new Line(this.react.sourceCenter, this.react.targetCenter),
            this.react.targetNote.react.worldRect.grow(16)
          ) ?? this.react.targetCenter
        );
      }),

      centerPos: computed(() =>
        this.react.sourcePos.lerp(this.react.targetPos, 0.5)
      ),

      angle: computed(() =>
        this.react.targetCenter.sub(this.react.sourceCenter).angle()
      ),

      color: {
        highlight: computed(() =>
          lightenByRatio(new Color(this.collab.color), 0.6).hex()
        ),
        light: computed(() =>
          lightenByRatio(new Color(this.collab.color), 0.3).hex()
        ),
        final: computed(() => {
          if (this.react.active) {
            return this.react.color.highlight;
          } else if (this.react.selected) {
            return this.react.color.light;
          } else {
            return this.collab.color;
          }
        }),
      },
    };

    Object.assign(this.react, react);

    if (!fake) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      nextTick(() => {
        // nextTick is necessary because the arrow may be created before the notes

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
    if (this.react.region.collab.arrowIds[this.react.index] !== this.id) {
      return;
    }

    this.react.region.collab.arrowIds.splice(this.react.index, 1);
  }
}
