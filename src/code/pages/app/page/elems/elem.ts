import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageLayer } from '../layers/layer';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export enum ElemType {
  NOTE = 'note',
  ARROW = 'arrow',
}

export interface IElemReact {
  regionId: string | null;
  region: ComputedRef<AppPage | PageNote>;

  layerId: string;
  layer: ComputedRef<PageLayer>;

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
    regionId: string | null,
    layerId: string,
    index: number
  ) {
    this.react = reactive({
      regionId,
      region: computed(() => this.page.regions.fromId(this.react.regionId)),

      layerId,
      layer: computed(() => this.page.layers.fromId(this.react.layerId)!),

      index,

      active: this.page.activeElem.is(this.id),
      selected: this.page.selection.has(this),
    });
  }
}
