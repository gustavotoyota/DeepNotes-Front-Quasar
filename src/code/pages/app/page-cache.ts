import {
  computed,
  ComputedRef,
  ShallowReactive,
  shallowReactive,
  UnwrapRef,
  watch,
} from 'vue';

import { factory } from '../static/composition-root';
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
          this.react.cache.length > 0 &&
          this.react.totalSize > 512 * 1024
        ) {
          this.react.cache.shift();
        }
      }
    );
  }

  async getPage(pageId: string) {
    let page = this.react.cache.find((item) => item.id === pageId);

    if (page != null) {
      return page;
    }

    page = factory.makePage(this.app, pageId);

    const pageData = await page.preSync();
    page.postSync(pageData);

    this.react.cache.push(page);

    return page;
  }
}
