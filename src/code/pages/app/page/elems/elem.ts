import { computed, ComputedRef, reactive, UnwrapRef } from 'vue';

import { AppPage } from '../page';
import { PageRegion } from '../regions/region';

export enum ElemType {
  PAGE = 'page',
  NOTE = 'note',
  ARROW = 'arrow',
}

export interface IElemReact {
  parentId: string | null;
  region: ComputedRef<PageRegion>;

  active: boolean;
  selected: boolean;

  index: number;
}

export class PageElem {
  readonly page: AppPage;

  readonly id: string;
  readonly type: ElemType;

  readonly react: UnwrapRef<IElemReact>;

  constructor(
    page: AppPage,
    id: string,
    type: ElemType,
    parentId: string | null
  ) {
    this.page = page;

    this.id = id;
    this.type = type;

    this.react = reactive({
      parentId: parentId,
      region: computed(() => {
        if (this.react.parentId == null) {
          return this.page;
        } else {
          return this.page.notes.fromId(this.react.parentId)!;
        }
      }),

      active: this.page && this.page.activeElem.is(this.id),
      selected: this.page && this.page.selection.has(this),

      index: -1,
    });
  }
}
