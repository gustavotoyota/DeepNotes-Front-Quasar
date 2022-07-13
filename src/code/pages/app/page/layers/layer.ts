import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';
import { z } from 'zod';

import { PageArrow } from '../arrows/arrow';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { IRegionElemIds } from '../regions/region';

export const ILayerCollab = IRegionElemIds.extend({
  name: z.string().default('Default layer'),

  nextZIndex: z.number().default(0),
});
export type ILayerCollabInput = z.input<typeof ILayerCollab>;
export type ILayerCollabOutput = z.output<typeof ILayerCollab>;

export interface ILayerReact {
  collab: ComputedRef<ILayerCollabOutput>;

  regionId: string;
  region: ComputedRef<AppPage | PageNote>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
}

export class PageLayer {
  declare readonly react: UnwrapNestedRefs<ILayerReact>;

  constructor(readonly page: AppPage, readonly id: string, regionId: string) {
    this.react = reactive({
      collab: computed(() => this.page.layers.react.collab[this.id]),

      regionId,
      region: computed(() => this.page.regions.fromId(this.react.regionId)!),

      notes: computed(() =>
        this.page.notes.fromIds(this.react.collab.noteIds, this.id)
      ),
      arrows: computed(() =>
        this.page.arrows.fromIds(this.react.collab.arrowIds, this.id)
      ),
    });
  }

  reverseChildren() {
    this.page.collab.doc.transact(() => {
      const children = this.react.collab.noteIds.splice(
        0,
        this.react.collab.noteIds.length
      );

      this.react.collab.noteIds.push(...children.reverse());
    });
  }
}
