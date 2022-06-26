import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageArrow } from '../arrows/arrow';
import { PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { IPageRegion } from '../regions/region';

export interface IActiveRegionReact {
  id: string | null;

  region: ComputedRef<IPageRegion>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
  elems: ComputedRef<PageElem[]>;
}

export class PageActiveRegion {
  readonly react: UnwrapNestedRefs<IActiveRegionReact>;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      id: null,

      region: computed(() => {
        if (this.react.id == null) {
          return this.page.react.currentLayer;
        } else {
          return this.page.notes.react.map[this.react.id];
        }
      }),

      noteIds: computed(() => this.react.region.react.collab.noteIds),
      arrowIds: computed(() => this.react.region.react.collab.arrowIds),

      notes: computed(() => this.react.region.react.notes),
      arrows: computed(() => this.react.region.react.arrows),

      elems: computed(() =>
        (this.react.notes as PageElem[]).concat(this.react.arrows)
      ),
    });
  }
}
