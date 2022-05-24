import { isUuid4 } from 'src/code/utils';
import { computed, ComputedRef, ShallowRef, shallowRef, UnwrapRef } from 'vue';
import { Router } from 'vue-router';

import { Factory, factory } from '../static/composition-root';
import { refProp } from '../static/vue';
import { AppPage } from './page/page';
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

  pathPageIds: string[];
  recentPageIds: string[];

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

      pathPageIds: [],
      recentPageIds: [],

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
      pathPageIds: string[];
      recentPageIds: string[];

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/pages', {
      initialPageId,
    });

    await this.realtime.connected;

    this.realtime.subscribe(
      response.data.pathPageIds
        .concat(response.data.recentPageIds)
        .map((pageId) => `pageName.${pageId}`)
    );

    this.react.pathPageIds = response.data.pathPageIds;
    this.react.recentPageIds = response.data.recentPageIds;

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }

  async updatePathPages(pageId: string) {
    if (this.react.pathPageIds.find((item) => item === pageId)) {
      return;
    }

    const currentPageIndex = this.react.pathPageIds.findIndex(
      (pageId) => pageId === this.react.pageId
    );

    if (currentPageIndex < 0) {
      // Current page is does not exist in path

      await this.loadData(pageId);

      return;
    }

    // Current page exists in path

    this.react.pathPageIds.splice(currentPageIndex + 1);

    this.react.pathPageIds.push(pageId);
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
