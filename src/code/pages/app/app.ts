import { pull } from 'lodash';
import { isUuid4 } from 'src/code/utils';
import {
  computed,
  ComputedRef,
  ShallowReactive,
  shallowReactive,
  ShallowRef,
  shallowRef,
  UnwrapRef,
} from 'vue';
import { Router } from 'vue-router';

import { Factory, factory } from '../static/composition-root';
import { refProp } from '../static/vue';
import { AppPage } from './page/page';
import { AppPageCache } from './page-cache';
import { AppRealtime } from './realtime';
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

export interface IPageRef {
  id: string;
  groupId: string | null;
  ownerId: string | null;
}

export interface IAppReact {
  mounted: boolean;

  pathPageIds: string[];
  recentPageIds: string[];

  page: ShallowRef<AppPage>;
  pageId: ComputedRef<string | null>;

  parentPageId: string | null;

  dictionary: ShallowReactive<Record<string, any>>;
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;
  readonly pageCache: AppPageCache;
  readonly realtime: AppRealtime;

  react: UnwrapRef<IAppReact>;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);
    this.pageCache = factory.makePageCache(this);
    this.realtime = factory.makeRealtime();

    this.react = refProp<IAppReact>(this, 'react', {
      mounted: false,

      pathPageIds: [],
      recentPageIds: [],

      page: shallowRef(null) as any,
      pageId: computed(() => {
        return this.react.page?.id ?? null;
      }),

      parentPageId: null,

      dictionary: shallowReactive({}),
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

      await router.push(`/pages/${dest}`);
    } else {
      location.assign(dest);
    }
  }

  async loadData(initialPageId: string) {
    const response = await $api.post<{
      pathPages: IPageRef[];
      recentPages: IPageRef[];

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/pages', {
      initialPageId,
    });

    await this.realtime.connected;

    this.react.pathPageIds = response.data.pathPages.map((page) => page.id);
    this.react.recentPageIds = response.data.recentPages.map((page) => page.id);

    response.data.pathPages.forEach((page) => {
      this.react.dictionary[`groupId.${page.id}`] = page.groupId;
      this.react.dictionary[`ownerId.${page.id}`] = page.ownerId;
    });
    response.data.recentPages.forEach((page) => {
      this.react.dictionary[`groupId.${page.id}`] = page.groupId;
      this.react.dictionary[`ownerId.${page.id}`] = page.ownerId;
    });

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }

  async bumpPage(pageId: string, fromParent?: boolean) {
    // New page exists in path

    const recentPage = this.react.recentPageIds.find(
      (recentPageId) => recentPageId === pageId
    );

    pull(this.react.recentPageIds, recentPage);

    this.react.recentPageIds.splice(0, 0, pageId);

    await $api.post('/api/pages/bump', {
      pageId,
      parentPageId: fromParent ? this.react.pageId : undefined,
    });
  }

  async updatePathPages(pageId: string) {
    if (this.react.pathPageIds.find((pathPageId) => pathPageId === pageId)) {
      // New page exists in path

      await this.bumpPage(pageId);

      return;
    }

    const currentPageIndex = this.react.pathPageIds.findIndex(
      (pagePageId) => pagePageId === this.react.pageId
    );

    if (currentPageIndex >= 0) {
      // Current page exists in path

      this.react.pathPageIds.splice(currentPageIndex + 1);
      this.react.pathPageIds.push(pageId);

      await this.bumpPage(pageId, true);

      return;
    }

    // Current page does not exist in path
    // Reload all path pages

    await this.loadData(pageId);
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
