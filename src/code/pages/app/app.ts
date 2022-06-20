import axios from 'axios';
import { from_base64, to_base64 } from 'libsodium-wrappers';
import { pull } from 'lodash';
import { logout } from 'src/code/auth';
import { privateKey } from 'src/code/crypto/private-key';
import {
  SymmetricKey,
  wrapSymmetricKey as wrapSymmetricKey,
} from 'src/code/crypto/symmetric-key';
import { Resolvable } from 'src/code/utils';
import { computed, ComputedRef, ShallowRef, shallowRef, UnwrapRef } from 'vue';
import { Router } from 'vue-router';

import { Factory, factory } from '../static/composition-root';
import { createComputedDict } from '../static/computed-dict';
import { refProp } from '../static/vue';
import { AppPage } from './page/page';
import { AppPageCache } from './page-cache';
import {
  AppRealtime,
  REALTIME_ENCRYPTED_PAGE_TITLE,
  REALTIME_USER_NOTIFICATION,
} from './realtime';
import { AppSerialization } from './serialization';
import { AppTemplates, ITemplate } from './templates';

export const DICT_PAGE_GROUP_ID = 'page-group-id';
export const DICT_GROUP_SYMMETRIC_KEY = 'group-symmetric-key';
export const DICT_GROUP_OWNER_ID = 'group-owner-id';
export const DICT_GROUP_ROLE_ID = 'group-role-id';

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

export interface IPageData {
  pageId: string;
  groupId: string | null;
}
export interface IGroupData {
  groupId: string;
  ownerId: string | null;
  encryptedSymmetricKey: string | null;
  encryptersPublicKey: string | null;
}

export interface IAppReact {
  pathPageIds: string[];
  recentPageIds: string[];

  page: ShallowRef<AppPage>;
  pageId: ComputedRef<string | null>;

  userId: string;
  publicKey: Uint8Array;

  dict: Record<string, any>;

  pageTitles: Record<string, string>;
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;
  readonly pageCache: AppPageCache;
  readonly realtime: AppRealtime;

  react: UnwrapRef<IAppReact>;

  parentPageId: string | null = null;

  readonly loadedPromise = new Resolvable();

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);
    this.pageCache = factory.makePageCache(this);
    this.realtime = factory.makeRealtime(
      process.env.DEV
        ? 'ws://192.168.1.4:31074/'
        : 'wss://realtime-server.deepnotes.app/'
    );

    this.react = refProp<IAppReact>(this, 'react', {
      pathPageIds: [],
      recentPageIds: [],

      page: shallowRef(null) as any,
      pageId: computed(() => {
        return this.react.page?.id ?? null;
      }),

      userId: null as any,
      publicKey: null as any,

      dict: {},

      pageTitles: createComputedDict({
        get: (pageId: string) => {
          const groupId: string =
            this.react.dict[`${DICT_PAGE_GROUP_ID}:${pageId}`];
          const symmetricKey: SymmetricKey =
            this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`];

          if (symmetricKey == null) {
            return '[Encrypted page title]';
          }

          const encryptedPageTitle = this.realtime.get(
            REALTIME_ENCRYPTED_PAGE_TITLE,
            pageId
          );

          if (encryptedPageTitle == null) {
            return '';
          }

          return new TextDecoder('utf-8').decode(
            symmetricKey.decrypt(from_base64(encryptedPageTitle))
          );
        },
        set: (pageId: string, value: string) => {
          const groupId: string =
            this.react.dict[`${DICT_PAGE_GROUP_ID}:${pageId}`];
          const symmetricKey: SymmetricKey =
            this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`];

          if (symmetricKey == null) {
            return;
          }

          const encryptedPageTitle = to_base64(
            symmetricKey.encrypt(new TextEncoder().encode(value))
          );

          this.realtime.set(
            REALTIME_ENCRYPTED_PAGE_TITLE,
            pageId,
            encryptedPageTitle
          );
        },
      }),
    });

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }

  async goToPage(pageId: string, router: Router, fromParent?: boolean) {
    this.parentPageId = fromParent ? this.react.pageId : null;

    await router.push(`/pages/${pageId}`);
  }

  async loadData() {
    const response = await $api.post<{
      userId: string;
      publicKey: string;

      templates: ITemplate[];
      defaultTemplateId: string;
    }>('/api/users/data');

    // Load user data

    this.react.userId = response.data.userId;
    this.react.publicKey = from_base64(response.data.publicKey);

    this.realtime.subscribe(
      `${REALTIME_USER_NOTIFICATION}:${this.react.userId}`
    );

    // Load templates

    this.templates.react.list = response.data.templates;
    this.templates.react.defaultId = response.data.defaultTemplateId;

    this.loadedPromise.resolve();
  }

  async loadPages(initialPageId: string) {
    const response = await $api.post<{
      pathPages: IPageData[];
      recentPages: IPageData[];

      groups: IGroupData[];
    }>('/api/users/pages', {
      initialPageId,
    });

    // Load pages

    this.react.pathPageIds = response.data.pathPages.map((page) => page.pageId);
    this.react.recentPageIds = response.data.recentPages.map(
      (page) => page.pageId
    );

    // Save values

    response.data.pathPages
      .concat(response.data.recentPages)
      .forEach((page) => {
        this.react.dict[`${DICT_PAGE_GROUP_ID}:${page.pageId}`] = page.groupId;
      });

    response.data.groups.forEach((group) => {
      this.react.dict[`${DICT_GROUP_OWNER_ID}:${group.groupId}`] =
        group.ownerId;

      if (
        group.encryptedSymmetricKey != null &&
        group.encryptersPublicKey != null
      ) {
        this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${group.groupId}`] =
          wrapSymmetricKey(
            privateKey.decrypt(
              from_base64(group.encryptedSymmetricKey),
              from_base64(group.encryptersPublicKey)
            )
          );
      }
    });
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

    await this.loadPages(nextPageId);
  }

  async setupPage(nextPageId: string) {
    try {
      const prevPageId = this.react.pageId;
      const wasCached = this.pageCache.has(nextPageId);

      let page;

      if (wasCached) {
        page = this.pageCache.get(nextPageId)!;
      } else {
        page = factory.makePage(this, nextPageId);

        this.pageCache.add(page);
      }

      $pages.react.page = page;

      await this.updatePathPages(prevPageId, nextPageId);

      if (wasCached) {
        await this.bumpPage(nextPageId);
      } else {
        await page.setup();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          logout();
        } else {
          $pages.react.page.react.status = 'error';
          $pages.react.page.react.errorMessage = err.response?.data.message;
          $pages.react.page.react.loading = false;
        }
      } else {
        console.error(err);
      }
    }
  }
}
