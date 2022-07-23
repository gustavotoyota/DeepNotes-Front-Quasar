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

  cleanedNotes: ComputedRef<(PageNote | null)[]>;
  cleanedArrows: ComputedRef<(PageArrow | null)[]>;

  validNotes: ComputedRef<PageNote[]>;
  validArrows: ComputedRef<PageArrow[]>;
}

export class PageLayer {
  declare readonly react: UnwrapNestedRefs<ILayerReact>;

  constructor(readonly page: AppPage, readonly id: string, regionId: string) {
    this.react = reactive({
      collab: computed(() => this.page.layers.react.collab[this.id]),

      regionId,
      region: computed(() => this.page.regions.fromId(this.react.regionId)!),

      cleanedNotes: computed(() =>
        this.page.notes.cleanedFromIds(this.react.collab.noteIds, this.id)
      ),
      cleanedArrows: computed(() =>
        this.page.arrows.cleanedFromIds(this.react.collab.arrowIds, this.id)
      ),

      validNotes: computed(() =>
        (this.react.cleanedNotes as PageNote[]).filter((note) => note != null)
      ),
      validArrows: computed(() =>
        (this.react.cleanedArrows as PageArrow[]).filter(
          (arrow) => arrow != null
        )
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
