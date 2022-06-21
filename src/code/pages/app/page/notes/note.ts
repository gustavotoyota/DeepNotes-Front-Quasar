import type { Editor } from '@tiptap/vue-3';
import Color from 'color';
import { hasVertScrollbar } from 'src/code/pages/static/dom';
import { Rect } from 'src/code/pages/static/rect';
import { IVec2, Vec2 } from 'src/code/pages/static/vec2';
import { darkenByRatio, lightenByRatio } from 'src/code/utils';
import {
  computed,
  ComputedRef,
  ShallowRef,
  shallowRef,
  UnwrapRef,
  WritableComputedRef,
} from 'vue';
import * as Y from 'yjs';
import { z } from 'zod';

import { PageArrow } from '../arrows/arrow';
import { ElemType, IElemReact } from '../elems/elem';
import { AppPage } from '../page';
import { IRegionCollab, IRegionReact, PageRegion } from '../regions/region';

export type NoteSide = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

export const INoteCollabSize = z
  .object({
    expanded: z.string().default('auto'),
    collapsed: z.string().default('auto'),
  })
  .default({});
export type INoteCollabSize = z.output<typeof INoteCollabSize>;

export const INoteCollabSection = z.object({
  height: INoteCollabSize,
});
export type INoteCollabSection = z.output<typeof INoteCollabSection>;

export const INoteCollabTextSection = INoteCollabSection.extend({
  enabled: z.boolean(),
  value: z.any().default(() => new Y.XmlFragment()) as z.ZodType<Y.XmlFragment>,
  wrap: z.boolean().default(true),
});
export type INoteCollabTextSection = z.output<typeof INoteCollabTextSection>;

export const INoteCollab = IRegionCollab.extend({
  link: z.string().nullable().default(null),

  anchor: IVec2.default({ x: 0.5, y: 0.5 }),
  pos: IVec2.default({ x: 0, y: 0 }),

  width: INoteCollabSize,

  head: INoteCollabTextSection.default(
    INoteCollabTextSection.parse({ enabled: true })
  ),
  body: INoteCollabTextSection.default(
    INoteCollabTextSection.parse({ enabled: false })
  ),

  container: INoteCollabSection.extend({
    enabled: z.boolean().default(false),

    horizontal: z.boolean().default(false),
    spatial: z.boolean().default(false),

    wrapChildren: z.boolean().default(false),
    stretchChildren: z.boolean().default(true),
  }).default({}),

  collapsing: z
    .object({
      enabled: z.boolean().default(false),
      collapsed: z.boolean().default(false),
      localCollapsing: z.boolean().default(false),
    })
    .default({}),

  movable: z.boolean().default(true),
  resizable: z.boolean().default(true),
  readOnly: z.boolean().default(false),

  color: z
    .object({
      inherit: z.boolean().default(true),
      value: z.string().default('#424242'),
    })
    .default({}),

  zIndex: z.number().default(-1),
});

export type NoteSection = 'head' | 'body' | 'container';
export type NoteTextSection = 'head' | 'body';

export interface INoteSize {
  expanded: WritableComputedRef<string>;
  collapsed: WritableComputedRef<string>;
}
export type NoteSizeProp = keyof INoteSize;

export interface INoteVec2React {
  x: WritableComputedRef<number>;
  y: WritableComputedRef<number>;
}

export interface INoteSectionReact {
  enabled: WritableComputedRef<boolean>;
  collabHeight: INoteSize;
}

export interface INoteTextSectionReact extends INoteSectionReact {
  wrap: WritableComputedRef<boolean>;
  editor: Editor | null;
}

export interface INoteReact extends IRegionReact {
  parent: WritableComputedRef<PageNote | null>;
  region: ComputedRef<PageRegion>;

  editing: boolean;
  dragging: boolean;
  resizing: boolean;
  ghost: boolean;

  head: {
    editor: ShallowRef<Editor | null>;
    visible: ComputedRef<boolean>;
    height: ComputedRef<string | undefined>;
  };
  body: {
    editor: ShallowRef<Editor | null>;
    visible: ComputedRef<boolean>;
    height: ComputedRef<string | undefined>;
  };
  container: {
    visible: ComputedRef<boolean>;
    height: ComputedRef<string | undefined>;
  };

  collapsing: {
    collapsed: WritableComputedRef<boolean>;
    locallyCollapsed: boolean;
  };

  sizeProp: ComputedRef<NoteSizeProp>;

  width: {
    stretched: ComputedRef<boolean>;
    parentPinned: ComputedRef<boolean>;
    selfPinned: ComputedRef<boolean>;
    pinned: ComputedRef<boolean>;

    min: ComputedRef<string | undefined>;
    self: ComputedRef<string>;
    final: ComputedRef<string | undefined>;
    target: ComputedRef<string | undefined>;
  };

  topSection: ComputedRef<NoteSection>;
  bottomSection: ComputedRef<NoteSection>;
  numEnabledSections: ComputedRef<number>;

  worldSize: Vec2;
  worldRect: ComputedRef<Rect>;
  worldCenter: ComputedRef<Vec2>;

  clientRect: ComputedRef<Rect>;

  cursor: ComputedRef<string | undefined>;

  color: {
    highlight: ComputedRef<string>;
    light: ComputedRef<string>;
    base: ComputedRef<string>;
    shadow: ComputedRef<string>;
    background: ComputedRef<string>;
  };

  link: {
    external: ComputedRef<boolean>;
  };

  numEditorsLoading: number;
  loaded: ComputedRef<boolean>;
}

export class PageNote extends PageRegion {
  readonly collab: z.output<typeof INoteCollab>;

  declare react: UnwrapRef<INoteReact>;

  private _parent: PageNote | null = null;

  incomingArrows: PageArrow[] = [];
  outgoingArrows: PageArrow[] = [];

  constructor(
    page: AppPage,
    id: string,
    parentId: string | null,
    collab: z.output<typeof INoteCollab>
  ) {
    super(page, id, ElemType.NOTE, parentId);

    this.collab = collab;

    const makeSectionHeight = (section: NoteSection) =>
      computed(() => {
        if (
          this.react.collapsing.collapsed &&
          this.collab[section].height.collapsed === 'auto'
        ) {
          if (this.react.numEnabledSections === 1) {
            return '0px';
          } else {
            return this.collab[section].height.expanded;
          }
        }

        return this.collab[section].height[this.react.sizeProp];
      });

    const react: Omit<INoteReact, keyof IElemReact> = {
      parent: computed({
        get: () => {
          return page?.notes.fromId(this.react.parentId) ?? this._parent;
        },
        set: (val) => {
          this._parent = val;
        },
      }),

      editing: false,
      dragging: false,
      resizing: false,
      ghost: false,

      head: {
        editor: shallowRef(null),
        visible: computed(() => this.collab.head.enabled),
        height: makeSectionHeight('head'),
      },
      body: {
        editor: shallowRef(null),
        visible: computed(
          () =>
            this.collab.body.enabled &&
            (!this.react.collapsing.collapsed ||
              this.react.topSection === 'body')
        ),
        height: makeSectionHeight('body'),
      },
      container: {
        visible: computed(
          () =>
            this.collab.container.enabled &&
            (!this.react.collapsing.collapsed ||
              this.react.topSection === 'container')
        ),
        height: makeSectionHeight('container'),
      },

      collapsing: {
        collapsed: computed({
          get: () => {
            if (!this.collab.collapsing.enabled) {
              return false;
            }

            if (
              this.page.react.readonly ||
              this.collab.collapsing.localCollapsing
            ) {
              return this.react.collapsing.locallyCollapsed;
            }

            return this.collab.collapsing.collapsed;
          },
          set: (val) => {
            if (
              this.page.react.readonly ||
              this.collab.collapsing.localCollapsing
            ) {
              this.react.collapsing.locallyCollapsed = val;
            } else {
              this.collab.collapsing.collapsed = val;
            }
          },
        }),
        locallyCollapsed: false,
      },

      sizeProp: computed(() =>
        this.react.collapsing.collapsed ? 'collapsed' : 'expanded'
      ),

      width: {
        stretched: computed(() => {
          return (
            this.react.parent != null &&
            !this.react.parent.collab.container.horizontal &&
            this.react.parent.collab.container.stretchChildren
          );
        }),
        parentPinned: computed(() => {
          return (
            this.react.parent != null &&
            this.react.parent.react.width.pinned &&
            this.react.width.stretched
          );
        }),
        selfPinned: computed(() => {
          return (
            this.react.parent == null && this.react.width.self.endsWith('px')
          );
        }),
        pinned: computed(() => {
          return this.react.width.parentPinned || this.react.width.selfPinned;
        }),

        min: computed(() => {
          if (
            // is empty container with unpinned width:
            !this.react.width.pinned &&
            this.collab.container.enabled &&
            this.react.notes.length === 0
          ) {
            return '130px';
          } else {
            return undefined;
          }
        }),
        self: computed(() => {
          if (
            this.react.collapsing.collapsed &&
            this.collab.width.collapsed === 'auto'
          ) {
            return this.collab.width.expanded;
          }

          return this.collab.width[this.react.sizeProp];
        }),
        final: computed(() => {
          if (this.react.width.stretched) {
            return undefined;
          }

          if (this.react.width.self.endsWith('px')) {
            return this.react.width.self;
          }

          return 'max-content';
        }),
        target: computed(() => {
          return this.react.width.pinned ? '0px' : undefined;
        }),
      },

      topSection: computed(() => {
        if (this.collab.head.enabled) {
          return 'head';
        } else if (this.collab.body.enabled) {
          return 'body';
        } else if (this.collab.container.enabled) {
          return 'container';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      bottomSection: computed(() => {
        if (this.react.collapsing.collapsed) {
          return this.react.topSection;
        } else if (this.collab.container.enabled) {
          return 'container';
        } else if (this.collab.body.enabled) {
          return 'body';
        } else if (this.collab.head.enabled) {
          return 'head';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      numEnabledSections: computed(() => {
        let numSections = 0;

        if (this.collab.head.enabled) {
          ++numSections;
        }
        if (this.collab.body.enabled) {
          ++numSections;
        }
        if (this.collab.container.enabled) {
          ++numSections;
        }

        return numSections;
      }),

      worldSize: new Vec2(),
      worldRect: computed(
        () =>
          new Rect(
            new Vec2(this.collab.pos).sub(
              new Vec2(this.collab.anchor).mul(this.react.worldSize)
            ),
            new Vec2(this.collab.pos).add(
              new Vec2(1)
                .sub(new Vec2(this.collab.anchor))
                .mul(this.react.worldSize)
            )
          )
      ),
      worldCenter: computed(() => this.react.worldRect.center),

      clientRect: computed(() =>
        page.rects.worldToClient(this.react.worldRect)
      ),

      noteIds: computed(() => this.collab.noteIds),
      arrowIds: computed(() => this.collab.arrowIds),

      notes: computed(() => page.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => page.arrows.fromIds(this.react.arrowIds)),

      cursor: computed(() => {
        if (this.react.editing) {
          return 'auto';
        }

        if (this.react.selected) {
          return 'default';
        }

        if (this.collab.link) {
          return 'pointer';
        }

        return undefined;
      }),

      color: {
        highlight: computed(() =>
          lightenByRatio(Color(this.react.color.base), 0.5).hex()
        ),
        light: computed(() =>
          lightenByRatio(Color(this.react.color.base), 0.25).hex()
        ),
        base: computed(() =>
          this.collab.color.inherit && this.react.parent != null
            ? this.react.parent.react.color.base
            : this.collab.color.value
        ),
        shadow: computed(() =>
          darkenByRatio(Color(this.react.color.base), 0.5).hex()
        ),
        background: computed(() => {
          if (this.react.active) {
            return this.react.color.highlight;
          } else if (this.react.selected) {
            return this.react.color.light;
          } else {
            return this.react.color.base;
          }
        }),
      },

      link: {
        external: computed(() => {
          if (this.collab.link == null) {
            return false;
          }

          if (
            !this.collab.link.startsWith('http://') &&
            !this.collab.link.startsWith('https://')
          ) {
            return false;
          }

          if (this.collab.link.startsWith(`${window.location.origin}/pages/`)) {
            return false;
          }

          return true;
        }),
      },

      numEditorsLoading: 0,
      loaded: computed(() => this.react.numEditorsLoading === 0),
    };

    Object.assign(this.react, react);
  }

  bringToTop() {
    if (this.collab.zIndex === this.page.react.collab.nextZIndex - 1) {
      return;
    }

    this.collab.zIndex = this.page.react.collab.nextZIndex++;
  }

  getNode(part: string | null): Element {
    if (part == null) {
      return document.getElementById(`note-${this.id}`) as Element;
    } else {
      return document.querySelector(`#note-${this.id} .${part}`) as Element;
    }
  }

  scrollIntoView() {
    if (this.react.parentId == null) {
      return;
    }

    const frameNode = this.getNode('note-frame');

    let auxNode = frameNode as Node;

    while (auxNode != null) {
      if (hasVertScrollbar(auxNode as HTMLElement)) {
        break;
      }

      auxNode = auxNode.parentNode as Node;
    }

    if (auxNode == null) {
      return;
    }

    frameNode.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  getClientRect(part: string) {
    const node = this.getNode(part);

    const domClientRect = node.getBoundingClientRect();

    return this.page.rects.fromDOM(domClientRect);
  }
  getDisplayRect(part: string) {
    return this.page.rects.clientToDisplay(this.getClientRect(part));
  }
  getWorldRect(part: string) {
    return this.page.rects.clientToWorld(this.getClientRect(part));
  }

  removeFromRegion() {
    this.react.region.react.noteIds.splice(this.react.index, 1);
  }
  moveToRegion(region: PageRegion, insertIndex?: number) {
    this.removeFromRegion();

    region.react.noteIds.splice(
      insertIndex ?? region.react.noteIds.length,
      0,
      this.id
    );

    this.react.parentId = region.id;
  }

  reverseChildren() {
    this.page.collab.doc.transact(() => {
      const children = this.collab.noteIds.splice(
        0,
        this.collab.noteIds.length
      );

      this.collab.noteIds.push(...children.reverse());
    });
  }
}
