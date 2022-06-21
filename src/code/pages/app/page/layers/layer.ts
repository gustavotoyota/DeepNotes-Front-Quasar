import { computed, reactive, UnwrapNestedRefs } from 'vue';
import { z } from 'zod';

import { AppPage } from '../page';
import { IPageRegion, IRegionCollab, IRegionReact } from '../regions/region';

export const ILayerCollab = IRegionCollab.extend({
  nextZIndex: z.number(),
});
export type ILayerCollab = z.output<typeof ILayerCollab>;

export class PageLayer implements IPageRegion {
  declare readonly react: UnwrapNestedRefs<IRegionReact>;

  constructor(
    readonly page: AppPage,
    readonly id: string,
    readonly collab: ILayerCollab
  ) {
    this.react = reactive({
      noteIds: computed(() => this.collab.noteIds),
      arrowIds: computed(() => this.collab.arrowIds),

      notes: computed(() => this.page.notes.fromIds(this.collab.noteIds)),
      arrows: computed(() => this.page.arrows.fromIds(this.collab.arrowIds)),
    });
  }
}
