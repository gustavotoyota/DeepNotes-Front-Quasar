import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageArrow } from '../arrows/arrow';
import { ElemType, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IActiveElemReact {
  id?: string;
  type?: ElemType;

  elem: ComputedRef<PageNote | PageArrow | null>;

  exists: ComputedRef<boolean>;
}

export class PageActiveElem {
  readonly react: UnwrapNestedRefs<IActiveElemReact>;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      elem: computed((): PageNote | PageArrow | null => {
        if (this.react.id == null || this.react.type == null) {
          return null;
        }

        const elems = this.page[`${this.react.type}s`];
        const activeElem = elems.react.map[this.react.id] ?? null;

        if (
          activeElem == null ||
          activeElem.react.region !== this.page.activeRegion.react.region
        ) {
          return null;
        }

        return activeElem;
      }),

      exists: computed(() => this.react.elem != null),
    });
  }

  is(elemId: string) {
    return elemId === this.react.id;
  }

  set(elem: PageElem | null) {
    if (elem?.id == this.react.id) {
      return;
    }

    if (this.react.elem != null) {
      this.react.elem.react.active = false;
    }

    this.react.id = elem?.id ?? undefined;
    this.react.type = elem?.type ?? ElemType.NOTE;

    if (elem == null) {
      return;
    }

    elem.react.active = true;

    this.page.selection.add(elem);

    if (elem instanceof PageNote) {
      elem.bringToTop();
    }
  }

  clear() {
    this.set(null);
  }
}
