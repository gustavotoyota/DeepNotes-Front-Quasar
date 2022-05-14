import {
  computed,
  ComputedRef,
  ShallowReactive,
  shallowReactive,
  UnwrapRef,
  watch,
} from 'vue';

import { refProp } from '../static/vue';
import { PagesApp } from './app';
import { AppPage } from './page/page';

export interface IPageCacheReact {
  cache: ShallowReactive<AppPage[]>;

  totalSize: ComputedRef<number>;
}

export class AppPageCache {
  readonly app: PagesApp;

  react: UnwrapRef<IPageCacheReact>;

  constructor(app: PagesApp) {
    this.app = app;

    this.react = refProp<IPageCacheReact>(this, 'react', {
      cache: [],

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
          this.react.cache.length > 0 &&
          this.react.totalSize > 512 * 1024
        ) {
          this.react.cache.shift();
        }
      }
    );
  }

  addPage(page: AppPage) {
    if (this.react.cache.find((item) => item.id === page.id)) {
      return;
    }

    if ($pages.react.pageId == null) {
      $pages.react.pageId = page.id;
    }

    this.react.cache.push(shallowReactive(page));
  }
}
