import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IActiveRegionReact {
  id: string | null;

  region: ComputedRef<AppPage | PageNote>;
}

export class PageActiveRegion {
  readonly react: UnwrapNestedRefs<IActiveRegionReact>;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      id: null,

      region: computed(() => this.page.regions.fromId(this.react.id)),
    });
  }
}
