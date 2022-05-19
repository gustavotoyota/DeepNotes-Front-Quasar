import { computed, ComputedRef, ShallowRef, shallowRef, UnwrapRef } from 'vue';
import { Router } from 'vue-router';

import { Factory, factory } from '../static/composition-root';
import { isUuid4 } from '../static/utils';
import { refProp } from '../static/vue';
import { AppPage, IPageReference } from './page/page';
import { AppPageCache } from './page-cache';
import { RealtimeClient } from './realtime-client';
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

  page: ShallowRef<AppPage>;
  pageId: ComputedRef<string | null>;

  parentPageId: string | null;
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;
  readonly pageCache: AppPageCache;
  readonly realtime: RealtimeClient;

  react: UnwrapRef<IAppReact>;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);
    this.pageCache = factory.makePageCache(this);
    this.realtime = factory.makeRealtimeClient();

    this.react = refProp<IAppReact>(this, 'react', {
      mounted: false,

      pathPages: [],
      recentPages: [],

      page: shallowRef(null) as any,
      pageId: computed(() => {
        return this.react.page?.id ?? null;
      }),

      parentPageId: null,
    });

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }

  async navigateTo(dest: string, router: Router, fromParent?: boolean) {
    console.log('navigateTo', dest);

    if (
      dest.startsWith('http://192.168.1.2:60379/pages/') ||
      dest.startsWith('https://deepnotes.app/pages/')
    ) {
      dest = dest.split('/').at(-1)!;
    }

    if (isUuid4(dest)) {
      this.react.parentPageId = fromParent ? this.react.pageId : null;

      router.push(`/pages/${dest}`);
    } else {
      location.assign(dest);
    }
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

    this.realtime.subscribe(
      response.data.pathPages.map((page) => `pageName.${page.id}`)
    );

    this.react.pathPages = response.data.pathPages;
    this.react.recentPages = response.data.recentPages;

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }

  async updatePathPages(pageId: string) {
    const newPageRef = this.react.pathPages.find((page) => page.id === pageId);

    if (newPageRef != null) {
      return;
    }

    const currentPageIndex = this.react.pathPages.findIndex(
      (page) => page.id === this.react.pageId
    );

    if (currentPageIndex >= 0) {
      this.react.pathPages.splice(currentPageIndex + 1);

      this.react.pathPages.push({
        id: pageId,
        name: '',
      });
    } else {
      await this.loadData(pageId);
    }
  }

  async setupPage(pageId: string) {
    console.log('Initialize page');

    await this.updatePathPages(pageId);

    if (this.pageCache.has(pageId)) {
      $pages.react.page = this.pageCache.get(pageId)!;
      return;
    }

    const page = factory.makePage(this, pageId);

    this.pageCache.add(page);

    $pages.react.page = page;

    await page.setup();
  }
}
