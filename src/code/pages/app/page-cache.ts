import {
  computed,
  ComputedRef,
  reactive,
  ShallowReactive,
  shallowReactive,
  UnwrapNestedRefs,
  watch,
} from 'vue';

import { PagesApp } from './app';
import { AppPage } from './page/page';

export interface IPageCacheReact {
  cache: ShallowReactive<AppPage[]>;

  totalSize: ComputedRef<number>;
}

export class AppPageCache {
  readonly react: UnwrapNestedRefs<IPageCacheReact>;

  constructor(readonly app: PagesApp) {
    this.app = app;

    this.react = reactive({
      cache: shallowReactive([]),

      totalSize: computed(() => {
        return this.react.cache.reduce((acc, item) => {
          return acc + item.react.size;
        }, 0);
      }),
    });

    watch(
      () => this.react.totalSize,
      () => {
        while (
          this.react.cache.length > 2 &&
          this.react.totalSize > 256 * 1024
        ) {
          const page = this.react.cache.shift();

          page?.destroy();
        }
      }
    );
  }

  get(pageId: string): AppPage | null {
    return this.react.cache.find((page) => page.id === pageId) ?? null;
  }
  has(pageId: string): boolean {
    return this.get(pageId) != null;
  }

  add(page: AppPage): void {
    this.react.cache.push(page);
  }
}
