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
  UnwrapNestedRefs,
  WritableComputedRef,
} from 'vue';
import * as Y from 'yjs';
import { z } from 'zod';

import { PageArrow } from '../arrows/arrow';
import { ElemType, IElemReact, PageElem } from '../elems/elem';
import { PageLayer } from '../layers/layer';
import { AppPage } from '../page';
import { IPageRegion, IRegionCollab, IRegionReact } from '../regions/region';

export type NoteSide = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

export const INoteCollabSize = z
  .object({
    expanded: z.string().default('auto'),
    collapsed: z.string().default('auto'),
  })
  .default({});
export type INoteCollabSizeInput = z.input<typeof INoteCollabSize>;
export type INoteCollabSizeOutput = z.output<typeof INoteCollabSize>;

export const INoteCollabSection = z.object({
  height: INoteCollabSize,
});
export type INoteCollabSectionInput = z.input<typeof INoteCollabSection>;
export type INoteCollabSectionOutput = z.output<typeof INoteCollabSection>;

export const INoteCollabTextSection = INoteCollabSection.extend({
  enabled: z.boolean(),
  value: (z.any() as z.ZodType<Y.XmlFragment>).default(
    () => new Y.XmlFragment()
  ),
  wrap: z.boolean().default(true),
});
export type INoteCollabTextSectionInput = z.input<
  typeof INoteCollabTextSection
>;
export type INoteCollabTextSectionOutput = z.output<
  typeof INoteCollabTextSection
>;

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
export type INoteCollabInput = z.input<typeof INoteCollab>;
export type INoteCollabOutput = z.output<typeof INoteCollab>;

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

export interface INoteReact extends IRegionReact, IElemReact {
  collab: ComputedRef<INoteCollabOutput>;

  editing: boolean;
  dragging: boolean;
  resizing: boolean;
  ghost: boolean;

  head: {
    editor: ShallowRef<Editor | null>;
    visible: ComputedRef<boolean>;
    height: ComputedRef<string>;
  };
  body: {
    editor: ShallowRef<Editor | null>;
    visible: ComputedRef<boolean>;
    height: ComputedRef<string>;
  };
  container: {
    visible: ComputedRef<boolean>;
    height: ComputedRef<string>;
  };

  collapsing: {
    collapsed: WritableComputedRef<boolean>;
    locallyCollapsed: boolean;
  };

  sizeProp: ComputedRef<NoteSizeProp>;

  spatial: ComputedRef<boolean>;

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
  allEditorsLoaded: boolean;
  loaded: ComputedRef<boolean>;
  initialized: boolean;
}

export class PageNote extends PageElem implements IPageRegion {
  declare readonly react: UnwrapNestedRefs<INoteReact>;

  readonly incomingArrows: PageArrow[] = [];
  readonly outgoingArrows: PageArrow[] = [];

  originElem!: Element;

  get originClientPos(): Vec2 {
    return this.page.rects.fromDOM(this.originElem.getBoundingClientRect())
      .topLeft;
  }

  constructor(
    page: AppPage,
    id: string,
    regionId: string | null,
    layerId: string,
    index: number,
    readonly collab?: INoteCollabOutput
  ) {
    super(page, id, ElemType.NOTE, regionId, layerId, index);

    const makeSectionHeight = (section: NoteSection) =>
      computed(() => {
        if (
          this.react.collapsing.collapsed &&
          this.react.collab[section].height.collapsed === 'auto'
        ) {
          if (this.react.numEnabledSections === 1) {
            return '0px';
          } else {
            return this.react.collab[section].height.expanded;
          }
        }

        return this.react.collab[section].height[this.react.sizeProp];
      });

    const react: Omit<INoteReact, keyof IElemReact> = {
      // Region

      collab: computed(
        () => this.collab ?? this.page.notes.react.collab[this.id]
      ),

      layers: computed(() => page.layers.fromIds(this.react.collab.layerIds)),

      topLayer: computed(() => this.react.layers.at(-1)!),

      activeLayer: computed(
        () =>
          this.page.layers.fromId(this.react.activeLayerId ?? null) ??
          this.react.topLayer
      ),

      noteIds: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.collab.noteIds);
        }

        return result;
      }),
      arrowIds: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.collab.arrowIds);
        }

        return result;
      }),

      notes: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.notes);
        }

        return result;
      }),
      arrows: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.arrows);
        }

        return result;
      }),
      elems: computed(() =>
        (this.react.notes as PageElem[]).concat(this.react.arrows)
      ),

      // Note

      editing: false,
      dragging: false,
      resizing: false,
      ghost: false,

      head: {
        editor: shallowRef(null),
        visible: computed(() => this.react.collab.head.enabled),
        height: makeSectionHeight('head'),
      },
      body: {
        editor: shallowRef(null),
        visible: computed(
          () =>
            this.react.collab.body.enabled &&
            (!this.react.collapsing.collapsed ||
              this.react.topSection === 'body')
        ),
        height: makeSectionHeight('body'),
      },
      container: {
        visible: computed(
          () =>
            this.react.collab.container.enabled &&
            (!this.react.collapsing.collapsed ||
              this.react.topSection === 'container')
        ),
        height: makeSectionHeight('container'),
      },

      collapsing: {
        collapsed: computed({
          get: () => {
            if (!this.react.collab.collapsing.enabled) {
              return false;
            }

            if (
              this.page.react.readonly ||
              this.react.collab.collapsing.localCollapsing
            ) {
              return this.react.collapsing.locallyCollapsed;
            }

            return this.react.collab.collapsing.collapsed;
          },
          set: (val) => {
            if (
              this.page.react.readonly ||
              this.react.collab.collapsing.localCollapsing
            ) {
              this.react.collapsing.locallyCollapsed = val;
            } else {
              this.react.collab.collapsing.collapsed = val;
            }
          },
        }),
        locallyCollapsed: false,
      },

      sizeProp: computed(() =>
        this.react.collapsing.collapsed ? 'collapsed' : 'expanded'
      ),

      spatial: computed(
        () =>
          this.react.region instanceof AppPage ||
          this.react.region.react.collab.container.spatial
      ),

      width: {
        stretched: computed(() => {
          return (
            this.react.region instanceof PageNote &&
            !this.react.region.react.collab.container.spatial &&
            !this.react.region.react.collab.container.horizontal &&
            this.react.region.react.collab.container.stretchChildren
          );
        }),
        parentPinned: computed(() => {
          return (
            this.react.region instanceof PageNote &&
            !this.react.region.react.collab.container.spatial &&
            this.react.region.react.width.pinned &&
            this.react.width.stretched
          );
        }),
        selfPinned: computed(() => {
          return this.react.width.self.endsWith('px');
        }),
        pinned: computed(() => {
          return this.react.width.parentPinned || this.react.width.selfPinned;
        }),

        min: computed(() => {
          if (
            // Is empty container with unpinned width:
            this.react.collab.container.enabled &&
            this.react.notes.length === 0
          ) {
            return '167px';
          } else {
            return undefined;
          }
        }),
        self: computed(() => {
          if (
            this.react.collapsing.collapsed &&
            this.react.collab.width.collapsed === 'auto'
          ) {
            return this.react.collab.width.expanded ?? 'auto';
          }

          return this.react.collab.width[this.react.sizeProp] ?? 'auto';
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
        if (this.react.collab.head.enabled) {
          return 'head';
        } else if (this.react.collab.body.enabled) {
          return 'body';
        } else if (this.react.collab.container.enabled) {
          return 'container';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      bottomSection: computed(() => {
        if (this.react.collapsing.collapsed) {
          return this.react.topSection;
        } else if (this.react.collab.container.enabled) {
          return 'container';
        } else if (this.react.collab.body.enabled) {
          return 'body';
        } else if (this.react.collab.head.enabled) {
          return 'head';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      numEnabledSections: computed(() => {
        let numSections = 0;

        if (this.react.collab.head.enabled) {
          ++numSections;
        }
        if (this.react.collab.body.enabled) {
          ++numSections;
        }
        if (this.react.collab.container.enabled) {
          ++numSections;
        }

        return numSections;
      }),

      worldSize: new Vec2(),
      worldRect: computed(
        () =>
          new Rect(
            new Vec2(this.react.collab.pos).sub(
              new Vec2(this.react.collab.anchor).mul(this.react.worldSize)
            ),
            new Vec2(this.react.collab.pos).add(
              new Vec2(1)
                .sub(new Vec2(this.react.collab.anchor))
                .mul(this.react.worldSize)
            )
          )
      ),
      worldCenter: computed(() => this.react.worldRect.center),

      cursor: computed(() => {
        if (this.react.editing) {
          return 'auto';
        }

        if (this.react.selected) {
          return 'default';
        }

        if (this.react.collab.link) {
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
          this.react.collab.color.inherit &&
          this.react.region instanceof PageNote
            ? this.react.region.react.color.base
            : this.react.collab.color.value
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
          if (this.react.collab.link == null) {
            return false;
          }

          if (
            !this.react.collab.link.startsWith('http://') &&
            !this.react.collab.link.startsWith('https://')
          ) {
            return false;
          }

          if (
            this.react.collab.link.startsWith(
              `${window.location.origin}/pages/`
            )
          ) {
            return false;
          }

          return true;
        }),
      },

      numEditorsLoading: 0,
      allEditorsLoaded: true,
      loaded: computed(() => {
        if (this.react.initialized) {
          return true;
        }

        for (const childNote of this.react.notes) {
          if (!childNote.react.allEditorsLoaded) {
            return false;
          }
        }

        return this.react.allEditorsLoaded;
      }),
      initialized: false,
    };

    Object.assign(this.react, react);
  }

  bringToTop() {
    if (
      this.react.collab.zIndex ===
      this.react.parentLayer.react.collab.nextZIndex - 1
    ) {
      return;
    }

    this.react.collab.zIndex = this.react.parentLayer.react.collab.nextZIndex++;
  }

  getNode(part: string | null): Element {
    if (part == null) {
      return document.getElementById(`note-${this.id}`) as Element;
    } else {
      return document.querySelector(`#note-${this.id} .${part}`) as Element;
    }
  }

  scrollIntoView() {
    if (this.react.region instanceof AppPage) {
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

  removeFromLayer() {
    if (
      this.react.parentLayer.react.collab.noteIds[this.react.index] === this.id
    ) {
      this.react.parentLayer.react.collab.noteIds.splice(this.react.index, 1);
    }
  }
  moveToLayer(layer: PageLayer, insertIndex?: number) {
    this.page.collab.doc.transact(() => {
      this.removeFromLayer();

      this.react.regionId = layer.react.regionId;
      this.react.parentLayerId = layer.id;

      layer.react.collab.noteIds.splice(
        insertIndex ?? layer.react.collab.noteIds.length,
        0,
        this.id
      );

      this.react.collab.zIndex = layer.react.collab.nextZIndex++;
    });
  }
}
