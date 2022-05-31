import { pull } from 'lodash';
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
  pageId: string;
  groupId: string | null;
  ownerId: string | null;
}

export interface IAppReact {
  mounted: boolean;

  pathPageIds: string[];
  recentPageIds: string[];

  page: ShallowRef<AppPage>;
  pageId: ComputedRef<string | null>;

  dict: ShallowReactive<Record<string, any>>;
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;
  readonly pageCache: AppPageCache;
  readonly realtime: AppRealtime;

  react: UnwrapRef<IAppReact>;

  userId!: string;

  parentPageId: string | null = null;

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

      dict: shallowReactive({}),
    });

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }

  async goToPage(pageId: string, router: Router, fromParent?: boolean) {
    this.parentPageId = fromParent ? this.react.pageId : null;

    await router.push(`/pages/${pageId}`);
  }

  async loadData(initialPageId: string) {
    const response = await $api.post<{
      userId: string;

      pathPages: IPageRef[];
      recentPages: IPageRef[];

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/pages', {
      initialPageId,
    });

    this.userId = response.data.userId;

    this.react.pathPageIds = response.data.pathPages.map((page) => page.pageId);
    this.react.recentPageIds = response.data.recentPages.map(
      (page) => page.pageId
    );

    response.data.pathPages
      .concat(response.data.recentPages)
      .forEach((page) => {
        this.react.dict[`pageGroupId.${page.pageId}`] = page.groupId;
        this.react.dict[`groupOwnerId.${page.groupId}`] = page.ownerId;
      });

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;
  }

  async bumpPage(pageId: string) {
    // New page exists in path

    const recentPageId = this.react.recentPageIds.find(
      (recentPageId) => recentPageId === pageId
    );

    pull(this.react.recentPageIds, recentPageId);

    this.react.recentPageIds.unshift(pageId);

    await $api.post('/api/pages/bump', {
      pageId,
      parentPageId: this.parentPageId,
    });

    this.parentPageId = null;
  }

  async updatePathPages(prevPageId: string | null, nextPageId: string) {
    if (
      this.react.pathPageIds.find((pathPageId) => pathPageId === nextPageId)
    ) {
      // New page exists in path

      return;
    }

    const prevPageIndex = this.react.pathPageIds.findIndex(
      (pagePageId) => pagePageId === prevPageId
    );

    if (prevPageIndex >= 0) {
      // Previous page exists in path

      this.react.pathPageIds.splice(prevPageIndex + 1);
      this.react.pathPageIds.push(nextPageId);

      return;
    }

    // Previous page does not exist in path
    // Reload all path pages

    await this.loadData(nextPageId);
  }

  async setupPage(nextPageId: string) {
    console.log('Initialize page');

    const prevPageId = this.react.pageId;
    const pageIsCached = this.pageCache.has(nextPageId);

    if (pageIsCached) {
      $pages.react.page = this.pageCache.get(nextPageId)!;
    } else {
      const page = factory.makePage(this, nextPageId);
      this.pageCache.add(page);
      $pages.react.page = page;
    }

    await this.updatePathPages(prevPageId, nextPageId);

    const promises = [this.bumpPage(nextPageId)];

    if (!pageIsCached) {
      promises.push($pages.react.page.setup());
    }

    await Promise.all(promises);
  }

  computeGroupName(groupId: string): string {
    if (groupId == null) {
      return '';
    }

    const groupOwnerId = $pages.react.dict[`groupOwnerId.${groupId}`];

    if (groupOwnerId == null) {
      return $pages.realtime.get('groupName', groupId) ?? '';
    }

    const groupOwnerName = $pages.realtime.get('userName', groupOwnerId);

    if (groupOwnerName == null) {
      return '';
    }

    return `${groupOwnerName}'s Group`;
  }
}
