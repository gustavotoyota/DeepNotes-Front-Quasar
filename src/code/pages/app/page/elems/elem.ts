import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageLayer } from '../layers/layer';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { IPageRegion } from '../regions/region';

export enum ElemType {
  NOTE = 'note',
  ARROW = 'arrow',
}

export interface IElemReact {
  layerId: string;
  layer: ComputedRef<PageLayer>;

  parentId: string | null;
  parent: ComputedRef<PageNote | null>;
  region: ComputedRef<IPageRegion>;

  active: boolean;
  selected: boolean;

  index: number;
}

export class PageElem {
  readonly react: UnwrapNestedRefs<IElemReact>;

  constructor(
    readonly page: AppPage,
    readonly id: string,
    readonly type: ElemType,
    layerId: string,
    parentId: string | null = null
  ) {
    this.react = reactive({
      layerId,
      layer: computed(() => this.page.layers.fromId(this.react.layerId)!),

      parentId,
      parent: computed(() => this.page.notes.fromId(this.react.parentId)!),
      region: computed(() => {
        if (this.react.parent == null) {
          return this.react.layer;
        } else {
          return this.react.parent;
        }
      }),

      active: this.page && this.page.activeElem.is(this.id),
      selected: this.page && this.page.selection.has(this),

      index: -1,
    });
  }
}
