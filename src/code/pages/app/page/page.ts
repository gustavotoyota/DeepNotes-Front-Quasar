import { from_base64 } from 'libsodium-wrappers';
import { privateKey } from 'src/code/crypto/private-key';
import {
  SymmetricKey,
  wrapSymmetricKey as wrapSymmetricKey,
} from 'src/code/crypto/symmetric-key';
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

import { Factory } from '../../static/composition-root';
import { rolesMap } from '../../static/roles';
import { watchUntilTrue } from '../../static/vue';
import {
  DICT_GROUP_OWNER_ID,
  DICT_GROUP_ROLE_ID,
  DICT_GROUP_SYMMETRIC_KEY,
  DICT_PAGE_GROUP_ID,
  PagesApp,
} from '../app';
import { REALTIME_GROUP_NAME, REALTIME_USER_DISPLAY_NAME } from '../realtime';
import { PageArrowCreation } from './arrows/arrow-creation';
import { PageArrows } from './arrows/arrows';
import { ICameraData, PageCamera } from './camera/camera';
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
  userStatus?: string;
  errorMessage?: string;

  title: WritableComputedRef<string>;

  groupId: WritableComputedRef<string>;
  groupName: WritableComputedRef<string>;
  ownerId: WritableComputedRef<string | null>;
  roleId: WritableComputedRef<string | null>;
  symmetricKey: WritableComputedRef<SymmetricKey>;

  readonly: ComputedRef<boolean>;

  numEditorsLoading: number;
  allEditorsLoaded: ComputedRef<boolean>;

  loading: boolean;
}

export interface IPageData {
  camera: ICameraData;

  groupId: string;
  ownerId: string;
  userStatus: string;
  roleId: string;

  encryptedSymmetricKey: string;
  encryptersPublicKey: string;
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

  unwatchUserDisplayName?: WatchStopHandle;

  constructor(factory: Factory, readonly app: PagesApp, readonly id: string) {
    this.react = reactive({
      // Page

      collab: computed(() => this.collab.store.page),

      noteIds: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.collab.noteIds);
        }

        return result;
      }),
      arrowIds: computed(() => {
        const result = [];

        for (const layer of this.react.layers) {
          result.push(...layer.react.collab.arrowIds);
        }

        return result;
      }),

      layers: computed(() => this.layers.fromIds(this.react.collab.layerIds)),
      notes: computed(() => this.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.arrows.fromIds(this.react.arrowIds)),
      elems: computed(() =>
        (this.react.notes as PageElem[]).concat(this.react.arrows)
      ),

      activeLayer: computed(
        () =>
          this.layers.fromId(this.react.activeLayerId ?? null) ??
          this.react.layers[0]
      ),

      size: 0,

      title: computed({
        get: () => this.app.react.pageTitles[this.id],
        set: (value) => {
          this.app.react.pageTitles[this.id] = value;
        },
      }),

      groupId: computed({
        get: () => this.app.react.dict[`${DICT_PAGE_GROUP_ID}:${this.id}`],
        set: (value) => {
          this.app.react.dict[`${DICT_PAGE_GROUP_ID}:${this.id}`] = value;
        },
      }),
      groupName: computed({
        get: () =>
          this.app.realtime.get(REALTIME_GROUP_NAME, this.react.groupId) ?? '',
        set: (value) => {
          this.app.realtime.set(REALTIME_GROUP_NAME, this.react.groupId, value);
        },
      }),
      ownerId: computed({
        get: () =>
          this.app.react.dict[`${DICT_GROUP_OWNER_ID}:${this.react.groupId}`],
        set: (value) => {
          this.app.react.dict[`${DICT_GROUP_OWNER_ID}:${this.react.groupId}`] =
            value;
        },
      }),
      roleId: computed({
        get: () =>
          this.app.react.dict[`${DICT_GROUP_ROLE_ID}:${this.react.groupId}`],
        set: (value) => {
          this.app.react.dict[`${DICT_GROUP_ROLE_ID}:${this.react.groupId}`] =
            value;
        },
      }),
      symmetricKey: computed({
        get: () =>
          this.app.react.dict[
            `${DICT_GROUP_SYMMETRIC_KEY}:${this.react.groupId}`
          ],
        set: (value) => {
          this.app.react.dict[
            `${DICT_GROUP_SYMMETRIC_KEY}:${this.react.groupId}`
          ] = value;
        },
      }),

      readonly: computed(
        () => !rolesMap[this.react.roleId!]?.permissions.editPages ?? true
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
    this.react.status = undefined;
    this.react.loading = true;

    // Request page data

    const response = await $api.post<IPageData>('/api/pages/data', {
      pageId: this.id,
      parentPageId: this.app.parentPageId,
    });

    this.app.parentPageId = null;

    // Save reactive data

    this.react.groupId = response.data.groupId;
    this.react.ownerId = response.data.ownerId;
    this.react.roleId = response.data.roleId;
    this.react.userStatus = response.data.userStatus;

    // Check if user is authorized

    if (
      response.data.encryptedSymmetricKey == null ||
      this.react.userStatus === 'invite'
    ) {
      this.react.status = 'unauthorized';
      this.react.loading = false;
      return;
    }

    // Decrypt, wrap and save symmetric key

    const symmetricKey = wrapSymmetricKey(
      privateKey.decrypt(
        from_base64(response.data.encryptedSymmetricKey),
        from_base64(response.data.encryptersPublicKey)
      )
    );

    this.react.symmetricKey = symmetricKey;

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

    this.camera.setup(response.data.camera);

    this.undoRedo.setup();

    this.react.status = 'success';

    await nextTick();
    await watchUntilTrue(() => this.react.allEditorsLoaded);

    this.react.loading = false;
  }

  destroy() {
    this.unwatchUserDisplayName?.();

    this.collab.websocketProvider?.disconnect();
  }
}
