import 'src/code/pages/static/types';

import { computed, ComputedRef, UnwrapRef, watch } from 'vue';
import { Router } from 'vue-router';

import { Factory } from '../static/composition-root';
import { refProp } from '../static/vue';
import { AppPage, IPageReference } from './page/page';
import { AppPageCache } from './page-cache';
import { AppSerialization } from './serialization';
import { AppTemplates, ITemplate } from './templates';

declare global {
  // eslint-disable-next-line no-var
  var __DEEP_NOTES__: {
    pages: Record<
      string,
      {
        zoom?: number;
      }
    >;
  };

  // eslint-disable-next-line no-var
  var $pages: PagesApp;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $pages: PagesApp;
  }
}

export interface IAppReact {
  mounted: boolean;

  pathPages: IPageReference[];
  recentPages: IPageReference[];

  pageId: string | null;
  page: ComputedRef<AppPage>;

  parentPageId: string | null;
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;
  readonly pageCache: AppPageCache;

  react: UnwrapRef<IAppReact>;

  ready: Promise<boolean>;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);
    this.pageCache = factory.makePageCache(this);

    this.react = refProp<IAppReact>(this, 'react', {
      mounted: false,

      pathPages: [],
      recentPages: [],

      pageId: null,
      page: computed(() => {
        return this.pageCache.react.cache.find((page) => {
          return page.id === this.react.pageId;
        }) as AppPage;
      }),

      parentPageId: null,
    });

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };

    this.ready = new Promise((resolve) => {
      const unwatch = watch(
        () => this.react.mounted,
        () => {
          if (this.react.mounted) {
            unwatch();
            resolve(this.react.mounted);
          }
        },
        { immediate: true }
      );
    });
  }

  async loadData(initialPageId: string) {
    const response = await $api.post<{
      pathPages: IPageReference[];
      recentPages: IPageReference[];

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/pages-data', {
      initialPageId,
    });

    this.react.pathPages = response.data.pathPages;
    this.react.recentPages = response.data.recentPages;

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }

  navigateTo(url: string, router: Router, fromParent?: boolean) {
    this.react.parentPageId = fromParent ? this.react.pageId : null;

    this.react.pageId = url;

    router.push(`/pages/${url}`);
  }
}
