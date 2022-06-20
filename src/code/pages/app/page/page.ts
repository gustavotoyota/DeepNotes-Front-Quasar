import { from_base64 } from 'libsodium-wrappers';
import { privateKey } from 'src/code/crypto/private-key';
import {
  SymmetricKey,
  wrapSymmetricKey as wrapSymmetricKey,
} from 'src/code/crypto/symmetric-key';
import {
  computed,
  ComputedRef,
  UnwrapRef,
  watch,
  WatchStopHandle,
  WritableComputedRef,
} from 'vue';
import { z } from 'zod';

import { Factory } from '../../static/composition-root';
import { rolesMap } from '../../static/roles';
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
import { ElemType, IElemReact } from './elems/elem';
import { PageElems } from './elems/elems';
import { PageCloning } from './notes/cloning';
import { PageDragging } from './notes/dragging';
import { PageDropping } from './notes/dropping';
import { PageEditing } from './notes/editing';
import { PageNotes } from './notes/notes';
import { PageResizing } from './notes/resizing';
import { IRegionCollab, IRegionReact, PageRegion } from './regions/region';
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
import { WebsocketProvider } from './y-websocket';

export const IPageCollab = IRegionCollab.extend({
  nextZIndex: z.number(),
});
export type IPageCollab = z.output<typeof IPageCollab>;

export interface IAppPageReact extends IRegionReact {
  collab: ComputedRef<IPageCollab>;
  size: number;

  status: string;
  userStatus: string | null;
  errorMessage: string;

  title: WritableComputedRef<string>;

  groupId: WritableComputedRef<string>;
  groupName: WritableComputedRef<string>;
  ownerId: WritableComputedRef<string | null>;
  roleId: WritableComputedRef<string | null>;
  symmetricKey: WritableComputedRef<SymmetricKey>;

  readonly: ComputedRef<boolean>;

  numPendingEditors: number;
  allEditorsLoaded: ComputedRef<boolean>;
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

export class AppPage extends PageRegion {
  readonly app: PagesApp;

  readonly id: string;

  declare readonly react: UnwrapRef<IAppPageReact>;

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

  constructor(factory: Factory, app: PagesApp, id: string) {
    super(null as any, id, ElemType.PAGE, null);

    this.app = app;

    this.id = id;

    const react: Omit<IAppPageReact, keyof IElemReact> = {
      // Page

      collab: computed(() => this.collab.store.page),
      size: 0,

      status: 'loading',
      userStatus: null,
      errorMessage: '',

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

      numPendingEditors: 0,
      allEditorsLoaded: computed(() => this.react.numPendingEditors === 0),

      // Region

      noteIds: computed(() => this.react.collab.noteIds),
      arrowIds: computed(() => this.react.collab.arrowIds),

      notes: computed(() => this.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.arrows.fromIds(this.react.arrowIds)),
    };

    Object.assign(this.react, react);

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
    this.react.status = 'loading';

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

    // Check if has permission

    if (
      response.data.encryptedSymmetricKey == null ||
      this.react.userStatus === 'invite'
    ) {
      this.react.status = 'unauthorized';
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

    // Setup websocket

    const roomName = `page:${this.id}`;

    this.collab.websocketProvider = new WebsocketProvider(
      process.env.DEV
        ? 'ws://192.168.1.4:33245'
        : 'wss://yjs-server.deepnotes.app',
      roomName,
      this.collab.doc,
      symmetricKey
    );

    await Promise.all([
      this.app.realtime.syncedPromise,

      this.collab.websocketProvider.syncedPromise,
    ]);

    // Post-sync setup

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

    if (this.collab.store.page.nextZIndex == null) {
      this.collab.reset();
    }

    this.elems.setup();

    this.camera.setup(response.data.camera);

    this.undoRedo.setup();

    this.react.size = this.collab.websocketProvider.size;

    this.react.status = 'success';
  }
}
