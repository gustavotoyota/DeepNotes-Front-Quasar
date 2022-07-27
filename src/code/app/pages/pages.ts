import sodium from 'libsodium-wrappers';
import { pull } from 'lodash';
import { Factory, factory } from 'src/code/app/composition-root';
import { saveGroupSymmetricKey } from 'src/code/app/crypto/crypto';
import { privateKey } from 'src/code/app/crypto/private-key';
import {
  SymmetricKey,
  wrapSymmetricKey as wrapSymmetricKey,
} from 'src/code/app/crypto/symmetric-key';
import { internals } from 'src/code/app/internals';
import { createComputedDict } from 'src/code/lib/computed-dict';
import { Resolvable } from 'src/code/lib/resolvable';
import { decodeText, encodeText } from 'src/code/lib/text';
import { Vec2 } from 'src/code/lib/vec2';
import {
  computed,
  ComputedRef,
  reactive,
  ShallowRef,
  shallowRef,
  UnwrapNestedRefs,
} from 'vue';
import { Router } from 'vue-router';

import { AppPage } from './page/page';
import { AppPageCache } from './page-cache';
import {
  AppRealtime,
  REALTIME_ENCRYPTED_GROUP_NAME,
  REALTIME_ENCRYPTED_PAGE_TITLE,
  REALTIME_USER_NOTIFICATION,
} from './realtime';
import {
  AppSerialization,
  ISerialArrowInput,
  ISerialObjectInput,
} from './serialization';

export const DICT_PAGE_GROUP_ID = 'page-group-id';
export const DICT_GROUP_SYMMETRIC_KEY = 'group-symmetric-key';
export const DICT_GROUP_OWNER_ID = 'group-owner-id';
export const DICT_GROUP_ROLE_ID = 'group-role-id';

declare global {
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
  symmetricKey: ShallowRef<SymmetricKey>;

  defaultNote: ShallowRef<ISerialObjectInput>;
  defaultArrow: ShallowRef<ISerialArrowInput>;

  mainGroupId: string;

  dict: Record<string, any>;

  pageTitles: Record<string, string>;
  groupNames: Record<string, string>;

  tableContextMenu: boolean;
  tableContextMenuPos: Vec2;
}

export class PagesApp {
  readonly serialization: AppSerialization;
  readonly pageCache: AppPageCache;
  readonly realtime: AppRealtime;

  readonly react: UnwrapNestedRefs<IAppReact>;

  parentPageId: string | null = null;

  readonly loadPromise = new Resolvable();

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.pageCache = factory.makePageCache(this);
    this.realtime = factory.makeRealtime(
      process.env.DEV
        ? 'ws://192.168.1.4:31074/'
        : 'wss://realtime-server.deepnotes.app/'
    );

    this.react = reactive({
      pathPageIds: [],
      recentPageIds: [],

      page: shallowRef(null) as any,
      pageId: computed(() => {
        return this.react.page?.id ?? null;
      }),

      userId: null as any,
      publicKey: null as any,
      symmetricKey: shallowRef(null as any),

      defaultNote: shallowRef({}),
      defaultArrow: shallowRef({
        sourceIndex: null as any,
        targetIndex: null as any,
      }),

      mainGroupId: null as any,

      dict: {},

      pageTitles: createComputedDict({
        get: (pageId: string) => {
          const groupId: string =
            this.react.dict[`${DICT_PAGE_GROUP_ID}:${pageId}`];
          const symmetricKey: SymmetricKey | undefined =
            this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`];

          if (symmetricKey == null || !symmetricKey.valid) {
            return '[Encrypted page title]';
          }

          const encryptedPageTitle = this.realtime.get(
            REALTIME_ENCRYPTED_PAGE_TITLE,
            pageId
          );

          if (encryptedPageTitle == null) {
            return '';
          }

          return decodeText(
            symmetricKey.decrypt(sodium.from_base64(encryptedPageTitle))
          );
        },
        set: (pageId: string, value: string) => {
          const groupId: string =
            this.react.dict[`${DICT_PAGE_GROUP_ID}:${pageId}`];
          const symmetricKey: SymmetricKey | undefined =
            this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`];

          if (symmetricKey == null || !symmetricKey.valid) {
            return;
          }

          const encryptedPageTitle = sodium.to_base64(
            symmetricKey.encrypt(encodeText(value))
          );

          this.realtime.set(
            REALTIME_ENCRYPTED_PAGE_TITLE,
            pageId,
            encryptedPageTitle
          );
        },
      }),
      groupNames: createComputedDict({
        get: (groupId: string) => {
          const symmetricKey: SymmetricKey | undefined =
            this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`];

          if (symmetricKey == null || !symmetricKey.valid) {
            return `[Group ${groupId}]`;
          }

          const encryptedGroupName = this.realtime.get(
            REALTIME_ENCRYPTED_GROUP_NAME,
            groupId
          );

          if (encryptedGroupName == null) {
            return '';
          }

          return decodeText(
            symmetricKey.decrypt(sodium.from_base64(encryptedGroupName))
          );
        },
        set: (groupId: string, value: string) => {
          const symmetricKey: SymmetricKey | undefined =
            this.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`];

          if (symmetricKey == null || !symmetricKey.valid) {
            return;
          }

          const encryptedGroupName = sodium.to_base64(
            symmetricKey.encrypt(encodeText(value))
          );

          this.realtime.set(
            REALTIME_ENCRYPTED_GROUP_NAME,
            groupId,
            encryptedGroupName
          );
        },
      }),

      tableContextMenu: false,
      tableContextMenuPos: new Vec2(),
    });
  }

  async goToPage(pageId: string, router: Router, fromParent?: boolean) {
    this.parentPageId = fromParent ? this.react.pageId : null;

    await router.push(`/pages/${pageId}`);
  }

  async loadData() {
    let response;

    try {
      response = await internals.api.post<{
        userId: string;

        publicKey: string;
        encryptedSymmetricKey: string;

        encryptedDefaultNote: string;
        encryptedDefaultArrow: string;

        mainGroupId: string;
      }>('/api/users/data');
    } catch (error) {
      console.log(error);
      return;
    }

    // Load user data

    this.react.userId = response.data.userId;
    this.react.publicKey = sodium.from_base64(response.data.publicKey);
    this.react.symmetricKey = wrapSymmetricKey(
      privateKey.decrypt(
        sodium.from_base64(response.data.encryptedSymmetricKey),
        this.react.publicKey
      )
    );

    this.react.defaultNote = JSON.parse(
      decodeText(
        this.react.symmetricKey.decrypt(
          sodium.from_base64(response.data.encryptedDefaultNote)
        )
      )
    );
    this.react.defaultArrow = JSON.parse(
      decodeText(
        this.react.symmetricKey.decrypt(
          sodium.from_base64(response.data.encryptedDefaultArrow)
        )
      )
    );

    this.react.mainGroupId = response.data.mainGroupId;

    this.realtime.subscribe(
      `${REALTIME_USER_NOTIFICATION}:${this.react.userId}`
    );

    this.loadPromise.resolve();
  }

  async setupPage(nextPageId: string) {
    const prevPageId = this.react.pageId;

    let page;

    if (this.pageCache.has(nextPageId)) {
      page = this.pageCache.get(nextPageId)!;
    } else {
      page = factory.makePage(this, nextPageId);

      this.pageCache.add(page);
    }

    $pages.react.page = page;

    await this.updatePathPages(prevPageId, nextPageId);

    if (!page.startedSetup) {
      try {
        await page.setup();
      } catch (error: any) {
        console.log(error);

        if (error.response?.status === 401) {
          page.react.status = 'unauthorized';
          page.react.loading = false;
        } else {
          page.react.status = 'error';
          page.react.errorMessage = error.response?.data.message;
          page.react.loading = false;
        }
      }
    } else {
      this.bumpPage(nextPageId);
    }
  }

  async updatePathPages(prevPageId: string | null, nextPageId: string) {
    if (
      this.react.pathPageIds.find((pathPageId) => pathPageId === nextPageId)
    ) {
      // New page exists in path
      // Do nothing

      return;
    }

    const prevPageIndex = this.react.pathPageIds.findIndex(
      (pagePageId) => pagePageId === prevPageId
    );

    if (prevPageIndex >= 0) {
      // Previous page exists in path
      // Insert new page in front of previous page

      this.react.pathPageIds.splice(prevPageIndex + 1);
      this.react.pathPageIds.push(nextPageId);

      return;
    }

    // Previous page does not exist in path
    // Try to load path pages

    try {
      await this.loadPages(nextPageId);
    } catch (error) {
      // Couldn't load path pages
      // Set new page as root page

      this.react.pathPageIds = [nextPageId];
    }
  }

  async loadPages(initialPageId: string) {
    const response = await internals.api.post<{
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
        saveGroupSymmetricKey(
          group.groupId,
          group.encryptedSymmetricKey,
          group.encryptersPublicKey
        );
      }
    });
  }

  bumpPage(pageId: string) {
    // New page exists in path

    this.bumpRecentPage(pageId);

    void internals.api.post('/api/pages/bump', {
      pageId,
      parentPageId: this.parentPageId,
    });

    this.parentPageId = null;
  }
  bumpRecentPage(pageId: string) {
    this.pageCache.bump(pageId);

    pull(this.react.recentPageIds, pageId);
    this.react.recentPageIds.unshift(pageId);
  }
}
