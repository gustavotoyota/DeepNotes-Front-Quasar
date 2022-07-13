import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';
import { z } from 'zod';

import { PageLayer } from '../layers/layer';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export enum ElemType {
  NOTE = 'note',
  ARROW = 'arrow',
}

export const IElemCollab = z.object({
  parentLayerId: z.string().uuid(),
});
export type IElemCollab = z.infer<typeof IElemCollab>;

export interface IElemReact {
  collab: ComputedRef<IElemCollab>;

  region: ComputedRef<AppPage | PageNote>;
  parentLayer: ComputedRef<PageLayer>;

  active: boolean;
  selected: boolean;
  editing: boolean;

  index: number;
}

export class PageElem {
  readonly react: UnwrapNestedRefs<IElemReact>;

  protected readonly _collab?: IElemCollab;

  constructor(
    readonly page: AppPage,
    readonly id: string,
    readonly type: ElemType,
    index: number,
    collab?: IElemCollab
  ) {
    this._collab = collab;

    this.react = reactive({
      collab: computed(
        () => this._collab ?? this.page[`${this.type}s`].react.collab[this.id]
      ),

      region: computed(() => {
        if (this.page.resizing.react.active) {
          const ghostRegion =
            this.page.resizing.react.ghosts[
              this.react.parentLayer?.react.regionId
            ];

          if (ghostRegion != null) {
            return ghostRegion;
          }
        }

        return this.page.regions.fromId(this.react.parentLayer?.react.regionId);
      }),

      parentLayer: computed(
        () => this.page.layers.fromId(this.react.collab?.parentLayerId)!
      ),

      index,

      active: this.page.activeElem.is(this.id),
      selected: this.page.selection.has(this),
      editing: this.page.editing.react.elemId === this.id,
    });
  }
}
