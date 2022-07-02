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

  parentLayerId: string;
  parentLayer: ComputedRef<PageLayer>;

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
      region: computed(() => {
        if (this.page.resizing.react.active) {
          const ghostRegion =
            this.page.resizing.react.ghosts[this.react.regionId!];

          if (ghostRegion != null) {
            return ghostRegion;
          }
        }

        return this.page.regions.fromId(this.react.regionId);
      }),

      parentLayerId: layerId,
      parentLayer: computed(
        () => this.page.layers.fromId(this.react.parentLayerId)!
      ),

      index,

      active: this.page.activeElem.is(this.id),
      selected: this.page.selection.has(this),
    });
  }
}
