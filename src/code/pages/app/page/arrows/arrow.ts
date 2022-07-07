import { ChainedCommands, Editor, isMarkActive } from '@tiptap/vue-3';
import Color from 'color';
import { getLineRectIntersection } from 'src/code/pages/static/geometry';
import { Line } from 'src/code/pages/static/line';
import { MarkName } from 'src/code/pages/static/tiptap';
import { Vec2 } from 'src/code/pages/static/vec2';
import { lightenByRatio } from 'src/code/utils';
import {
  computed,
  ComputedRef,
  nextTick,
  ShallowRef,
  shallowRef,
  UnwrapNestedRefs,
} from 'vue';
import * as Y from 'yjs';
import { z } from 'zod';

import { ElemType, IElemReact, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export const IArrowCollab = z.object({
  sourceId: z.string().uuid().optional(),
  targetId: z.string().uuid().optional(),

  label: z.any().default(() => new Y.XmlFragment()) as z.ZodType<Y.XmlFragment>,

  backward: z.boolean().default(false),
  forward: z.boolean().default(true),

  dashed: z.boolean().default(false),

  color: z.string().default('#b0b0b0'),

  readOnly: z.boolean().default(false),
});
export type IArrowCollabInput = z.input<typeof IArrowCollab>;
export type IArrowCollabOutput = z.output<typeof IArrowCollab>;

export interface IArrowReact extends IElemReact {
  collab: ComputedRef<IArrowCollabOutput>;

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

  editor: ShallowRef<Editor | null>;
  editors: ComputedRef<Editor[]>;

  loaded: boolean;
}

export class PageArrow extends PageElem {
  static readonly ARROW_SIZE = 10;

  declare readonly react: UnwrapNestedRefs<IArrowReact>;

  constructor(
    page: AppPage,
    id: string,
    regionId: string | null,
    layerId: string,
    index: number,
    readonly collab?: IArrowCollabOutput
  ) {
    super(page, id, ElemType.ARROW, regionId, layerId, index);

    const react: Omit<IArrowReact, keyof IElemReact> = {
      collab: computed(
        () => this.collab ?? this.page.arrows.react.collab[this.id]
      ),

      fakeTargetPos: this.collab ? new Vec2() : null,

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
          this.react.sourceNote.react.region === this.react.region &&
          this.react.targetNote.react.region === this.react.region
        );
      }),

      sourceNote: computed(
        () => this.page.notes.react.map[this.react.collab.sourceId!]
      ),
      targetNote: computed(
        () => this.page.notes.react.map[this.react.collab.targetId!]
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
          lightenByRatio(new Color(this.react.collab.color), 0.6).hex()
        ),
        light: computed(() =>
          lightenByRatio(new Color(this.react.collab.color), 0.3).hex()
        ),
        final: computed(() => {
          if (this.react.active) {
            return this.react.color.highlight;
          } else if (this.react.selected) {
            return this.react.color.light;
          } else {
            return this.react.collab.color;
          }
        }),
      },

      editor: shallowRef(null),
      editors: computed(() =>
        this.react.editor != null ? [this.react.editor] : []
      ),

      loaded: true,
    };

    Object.assign(this.react, react);

    if (!this.collab) {
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

  removeFromLayer() {
    if (
      this.react.parentLayer.react.collab.arrowIds[this.react.index] !== this.id
    ) {
      return;
    }

    this.react.parentLayer.react.collab.arrowIds.splice(this.react.index, 1);
  }

  isMarkActive(name: MarkName) {
    for (const editor of this.react.editors) {
      if (!isMarkActive(editor.state, name)) {
        return false;
      }
    }

    return true;
  }
  setMark(name: MarkName, attribs?: Record<string, any>) {
    if (this.react.editing) {
      if (this.react.editor != null) {
        this.react.editor.chain().focus().setMark(name, attribs).run();
      }
    } else {
      for (const editor of this.react.editors) {
        editor.chain().selectAll().setMark(name, attribs).run();
      }
    }
  }
  unsetMark(name: MarkName) {
    if (this.react.editing) {
      if (this.react.editor != null) {
        this.react.editor.chain().focus().unsetMark(name).run();
      }
    } else {
      for (const editor of this.react.editors) {
        editor.chain().selectAll().unsetMark(name).run();
      }
    }
  }
  toggleMark(name: MarkName, attribs?: Record<string, any>) {
    if (this.isMarkActive(name)) {
      this.unsetMark(name);
    } else {
      this.setMark(name, attribs);
    }
  }

  format(chainFunc: (chain: ChainedCommands) => ChainedCommands) {
    if (this.react.editing) {
      if (this.react.editor != null) {
        chainFunc(this.react.editor.chain().focus()).run();
      }
    } else {
      for (const editor of this.react.editors) {
        chainFunc(editor.chain().selectAll()).run();
      }
    }
  }
}
