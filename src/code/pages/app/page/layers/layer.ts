import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';
import { z } from 'zod';

import { AppPage } from '../page';
import { IPageRegion, IRegionCollab, IRegionReact } from '../regions/region';

export const ILayerCollab = IRegionCollab.extend({
  nextZIndex: z.number(),
});
export type ILayerCollab = z.output<typeof ILayerCollab>;

export interface ILayerReact extends IRegionReact {
  collab: ComputedRef<ILayerCollab>;
}

export class PageLayer implements IPageRegion {
  declare readonly react: UnwrapNestedRefs<ILayerReact>;

  constructor(readonly page: AppPage, readonly id: string) {
    this.react = reactive({
      collab: computed(() => this.page.layers.react.collab[this.id]),

      noteIds: computed(() => this.react.collab.noteIds),
      arrowIds: computed(() => this.react.collab.arrowIds),

      notes: computed(() => this.page.notes.fromIds(this.react.collab.noteIds)),
      arrows: computed(() =>
        this.page.arrows.fromIds(this.react.collab.arrowIds)
      ),
    });
  }
}
