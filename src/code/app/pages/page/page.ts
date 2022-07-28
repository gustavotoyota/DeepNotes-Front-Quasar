import sodium from 'libsodium-wrappers';
import { Factory } from 'src/code/app/composition-root';
import { internals } from 'src/code/app/internals';
import {
  DICT_GROUP_IS_PUBLIC,
  DICT_GROUP_OWNER_ID,
  DICT_GROUP_ROLE_ID,
  DICT_GROUP_SYMMETRIC_KEY,
  DICT_GROUP_USER_STATUS,
  DICT_PAGE_GROUP_ID,
  PagesApp,
} from 'src/code/app/pages/pages';
import { rolesMap } from 'src/code/app/roles';
import { dictProp } from 'src/code/app/utils';
import { privateKey } from 'src/code/lib/crypto/private-key';
import {
  SymmetricKey,
  wrapSymmetricKey,
} from 'src/code/lib/crypto/symmetric-key';
import { Vec2 } from 'src/code/lib/vec2';
import { watchUntilTrue } from 'src/code/lib/vue';
import {
  computed,
  ComputedRef,
  nextTick,
  reactive,
  UnwrapNestedRefs,
  watch,
  WatchStopHandle,
  WritableComputedRef,
} from 'vue';
import { z } from 'zod';

import { REALTIME_USER_DISPLAY_NAME } from '../realtime';
import { PageArrow } from './arrows/arrow';
import { PageArrowCreation } from './arrows/arrow-creation';
import { PageArrows } from './arrows/arrows';
import { PageCamera } from './camera/camera';
import { PagePanning } from './camera/panning';
import { PagePinching } from './camera/pinching';
import { PageZooming } from './camera/zooming';
import { PageCollab } from './collab';
import { PageClipboard } from './elems/clipboard';
import { PageDeleting } from './elems/deleting';
import { PageElem } from './elems/elem';
import { PageElems } from './elems/elems';
import { PageLayers } from './layers/layers';
import { PageCloning } from './notes/cloning';
import { PageDragging } from './notes/dragging';
import { PageDropping } from './notes/dropping';
import { PageEditing } from './notes/editing';
import { PageNote } from './notes/note';
import { PageNotes } from './notes/notes';
import { PageResizing } from './notes/resizing';
import { IPageRegion, IRegionCollab, IRegionReact } from './regions/region';
import { PageRegions } from './regions/regions';
import { PageActiveElem } from './selection/active-elem';
import { PageActiveRegion } from './selection/active-region';
import { PageBoxSelection } from './selection/box-selection';
import { PageClickSelection } from './selection/click-selection';
import { PageSelection } from './selection/selection';
import { PagePos } from './space/pos';
import { PageRects } from './space/rects';
import { PageSizes } from './space/sizes';
import { PageUndoRedo } from './undo-redo';

export const IPageCollab = IRegionCollab;
export type IPageCollabInput = z.input<typeof IPageCollab>;
export type IPageCollabOutput = z.output<typeof IPageCollab>;

export interface IAppPageReact extends IRegionReact {
  collab: ComputedRef<IPageCollabOutput>;

  size: number;

  status?: string;
  errorMessage?: string;

  title: WritableComputedRef<string>;

  groupId: WritableComputedRef<string>;
  groupName: WritableComputedRef<string>;
  groupOwnerId: WritableComputedRef<string | null>;
  groupUserStatus: WritableComputedRef<string | null>;
  groupRoleId: WritableComputedRef<string | null>;
  groupIsPublic: WritableComputedRef<boolean>;
  groupSymmetricKey: WritableComputedRef<SymmetricKey>;
  groupReadOnly: ComputedRef<boolean>;

  numEditorsLoading: number;
  allEditorsLoaded: ComputedRef<boolean>;

  loading: boolean;
}

export class AppPage implements IPageRegion {
  readonly react: UnwrapNestedRefs<IAppPageReact>;

  readonly collab: PageCollab;
  readonly undoRedo: PageUndoRedo;

  readonly pos: PagePos;
  readonly rects: PageRects;
  readonly sizes: PageSizes;

  readonly camera: PageCamera;
  readonly panning: PagePanning;
  readonly zooming: PageZooming;
  readonly pinching: PagePinching;

  readonly selection: PageSelection;
  readonly activeElem: PageActiveElem;
  readonly activeRegion: PageActiveRegion;
  readonly clickSelection: PageClickSelection;
  readonly boxSelection: PageBoxSelection;

  readonly layers: PageLayers;

  readonly regions: PageRegions;

  readonly elems: PageElems;
  readonly deleting: PageDeleting;
  readonly clipboard: PageClipboard;

  readonly notes: PageNotes;
  readonly editing: PageEditing;
  readonly dragging: PageDragging;
  readonly dropping: PageDropping;
  readonly cloning: PageCloning;
  readonly resizing: PageResizing;

  readonly arrows: PageArrows;
  readonly arrowCreation: PageArrowCreation;

  startedSetup = false;

  unwatchUserDisplayName?: WatchStopHandle;

  originElem!: Element;
  encryptedGroupSymmetricKey!: Uint8Array;

  get originClientPos(): Vec2 {
    return this.rects.fromDOM(this.originElem.getBoundingClientRect()).topLeft;
  }

  constructor(factory: Factory, readonly app: PagesApp, readonly id: string) {
    this.react = reactive({
      // Region

      collab: computed(() => this.collab.store.page),

      layers: computed(() => this.layers.fromIds(this.react.collab.layerIds)),
      topLayer: computed(() => this.react.layers.at(-1)!),
      activeLayer: computed(
        () =>
          this.layers.fromId(this.react.activeLayerId ?? null) ??
          this.react.topLayer
      ),

      cleanedNotes: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.cleanedNotes);
        }

        return result;
      }),
      cleanedArrows: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.cleanedArrows);
        }

        return result;
      }),

      validNotes: computed(() =>
        (this.react.cleanedNotes as PageNote[]).filter((note) => note != null)
      ),
      validArrows: computed(() =>
        (this.react.cleanedArrows as PageArrow[]).filter(
          (arrow) => arrow != null
        )
      ),
      elems: computed(() =>
        (this.react.validNotes as PageElem[]).concat(this.react.validArrows)
      ),

      // Page

      size: 0,

      title: computed({
        get: () => this.app.react.pageTitles[this.id],
        set: (value) => {
          this.app.react.pageTitles[this.id] = value;
        },
      }),

      groupId: dictProp(DICT_PAGE_GROUP_ID, () => this.id),
      groupName: computed({
        get: () => this.app.react.groupNames[this.react.groupId],
        set: (value) => {
          this.app.react.groupNames[this.react.groupId] = value;
        },
      }),
      groupOwnerId: dictProp(DICT_GROUP_OWNER_ID, () => this.react.groupId),
      groupUserStatus: dictProp(
        DICT_GROUP_USER_STATUS,
        () => this.react.groupId
      ),
      groupRoleId: dictProp(DICT_GROUP_ROLE_ID, () => this.react.groupId),
      groupIsPublic: dictProp(DICT_GROUP_IS_PUBLIC, () => this.react.groupId),
      groupSymmetricKey: dictProp(
        DICT_GROUP_SYMMETRIC_KEY,
        () => this.react.groupId
      ),

      groupReadOnly: computed(
        () =>
          !rolesMap[this.react.groupRoleId ?? '']?.permissions.editPages ?? true
      ),

      numEditorsLoading: 0,
      allEditorsLoaded: computed(() => this.react.numEditorsLoading === 0),

      loading: true,
    });

    this.collab = factory.makeCollab(this);
    this.undoRedo = factory.makeUndoRedo(this);

    this.pos = factory.makePos(this);
    this.rects = factory.makeRects(this);
    this.sizes = factory.makeSizes(this);

    this.camera = factory.makeCamera(this);
    this.panning = factory.makePanning(this);
    this.zooming = factory.makeZooming(this);
    this.pinching = factory.makePinching(this);

    this.selection = factory.makeSelection(this);
    this.activeElem = factory.makeActiveElem(this);
    this.activeRegion = factory.makeActiveRegion(this);
    this.clickSelection = factory.makeClickSelection(this);
    this.boxSelection = factory.makeBoxSelection(this);

    this.layers = factory.makeLayers(this);

    this.regions = factory.makeRegions(this);

    this.elems = factory.makeElems(this);
    this.deleting = factory.makeDeleting(this);
    this.clipboard = factory.makeClipboard(this);

    this.notes = factory.makeNotes(this);
    this.editing = factory.makeEditing(this);
    this.dragging = factory.makeDragging(this);
    this.dropping = factory.makeDropping(this);
    this.cloning = factory.makeCloning(this);
    this.resizing = factory.makeResizing(this);

    this.arrows = factory.makeArrows(this);
    this.arrowCreation = factory.makeArrowCreation(this);
  }

  async setup() {
    this.startedSetup = true;

    this.app.bumpRecentPage(this.id);

    this.react.status = undefined;
    this.react.loading = true;

    // Request page data

    const parentPageId = this.app.parentPageId;
    this.app.parentPageId = null;

    const response = await internals.api.post<{
      groupId: string;
      groupOwnerId: string | null;
      groupUserStatus: string | null;
      groupRoleId: string | null;

      groupIsPublic: boolean;

      groupSymmetricKey: string | undefined;
      encryptersPublicKey: string | undefined;
    }>('/pages/data', {
      pageId: this.id,
      parentPageId,
    });

    // Save reactive data

    this.react.groupId = response.data.groupId;
    this.react.groupOwnerId = response.data.groupOwnerId;
    this.react.groupUserStatus = response.data.groupUserStatus;
    this.react.groupIsPublic = response.data.groupIsPublic;
    this.react.groupRoleId = response.data.groupRoleId;

    // Check if user is authorized

    if (
      response.data.groupSymmetricKey == null ||
      (!response.data.groupIsPublic &&
        response.data.encryptersPublicKey == null) ||
      this.react.groupUserStatus === 'invite'
    ) {
      this.react.status = 'unauthorized';
      this.react.loading = false;
      return;
    }

    // If group is password protected
    // Setup password screen

    if (
      (!response.data.groupIsPublic &&
        response.data.groupSymmetricKey.length > 96) ||
      (response.data.groupIsPublic &&
        response.data.groupSymmetricKey.length > 96)
    ) {
      const symmetricKey: SymmetricKey | undefined =
        $pages.react.dict[
          `${DICT_GROUP_SYMMETRIC_KEY}:${response.data.groupId}`
        ];

      if (symmetricKey == null || !symmetricKey.valid) {
        this.encryptedGroupSymmetricKey = privateKey.decrypt(
          sodium.from_base64(response.data.groupSymmetricKey),
          sodium.from_base64(response.data.encryptersPublicKey!)
        );

        this.react.status = 'password';
        this.react.loading = false;
      }

      return;
    }

    let decryptedGroupSymmetricKey;

    if (response.data.groupIsPublic) {
      decryptedGroupSymmetricKey = sodium.from_base64(
        response.data.groupSymmetricKey
      );
    } else {
      decryptedGroupSymmetricKey = privateKey.decrypt(
        sodium.from_base64(response.data.groupSymmetricKey),
        sodium.from_base64(response.data.encryptersPublicKey!)
      );
    }

    const wrappedGroupSymmetricKey = wrapSymmetricKey(
      decryptedGroupSymmetricKey
    );

    $pages.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${response.data.groupId}`] =
      wrappedGroupSymmetricKey;

    await this.finishSetup();
  }

  async finishSetup() {
    this.react.loading = true;

    // Synchronize collaboration

    await this.collab.synchronize();

    // Post-sync setup

    this.react.size = this.collab.websocketProvider.size;

    this.unwatchUserDisplayName = watch(
      () =>
        this.app.realtime.get(
          REALTIME_USER_DISPLAY_NAME,
          this.app.react.userId
        ),
      (value) => {
        this.collab.websocketProvider.awareness.setLocalStateField('user', {
          name: value,
        });
      },
      { immediate: true }
    );

    if (this.collab.store.page.layerIds == null) {
      this.collab.reset();
    }

    this.elems.setup();

    this.undoRedo.setup();

    this.react.status = 'success';

    await nextTick();
    await watchUntilTrue(() => this.react.allEditorsLoaded);
    await nextTick();

    this.camera.fitToScreen();

    this.react.loading = false;
  }

  destroy() {
    this.unwatchUserDisplayName?.();

    this.camera.destroy();
    this.pinching.destroy();

    this.collab.websocketProvider?.disconnect();
  }
}
