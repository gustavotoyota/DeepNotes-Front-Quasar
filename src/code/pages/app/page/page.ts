import { from_base64 } from 'libsodium-wrappers';
import { privateKey } from 'src/code/crypto/private-key';
import { createSymmetricKey } from 'src/code/crypto/symmetric-key';
import { refProp } from 'src/code/pages/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { z } from 'zod';

import { Factory } from '../../static/composition-root';
import { PagesApp } from '../app';
import { PageArrows } from './arrows/arrows';
import { ICameraData, PageCamera } from './camera/camera';
import { PagePanning } from './camera/panning';
import { PageZooming } from './camera/zooming';
import { PageCollab } from './collab';
import { PageClipboard } from './elems/clipboard';
import { PageDeleting } from './elems/deleting';
import { ElemType } from './elems/elem';
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
import { WebsocketProvider } from './y-websocket';

export const IPageCollab = IRegionCollab.extend({
  nextZIndex: z.number(),
});
export type IPageCollab = z.output<typeof IPageCollab>;

export interface IAppPageReact extends IRegionReact {
  name: string;

  loaded: boolean;
  hasPermission: boolean;

  collab: ComputedRef<IPageCollab>;

  size: number;

  userStatus: string | null;
}

export interface IPageData {
  camera: ICameraData;

  groupId: string;
  ownerId: string;
  userStatus: string;
  roleId: string;

  encryptedSymmetricKey: string;
  distributorsPublicKey: string;
}

export class AppPage extends PageRegion {
  readonly app: PagesApp;

  readonly id: string;

  react: UnwrapRef<IAppPageReact>;

  readonly collab: PageCollab;

  readonly pos: PagePos;
  readonly rects: PageRects;
  readonly sizes: PageSizes;

  readonly camera: PageCamera;
  readonly panning: PagePanning;
  readonly zooming: PageZooming;

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

  groupId!: string;
  ownerId!: string;
  roleId!: string;

  constructor(factory: Factory, app: PagesApp, id: string) {
    super(null as any, id, ElemType.PAGE, null);

    this.app = app;

    this.id = id;

    this.react = refProp<IAppPageReact>(this, 'react', {
      // Page

      name: '',

      loaded: false,
      hasPermission: true,

      collab: computed(() => this.collab.store.page),

      size: 0,

      userStatus: null,

      // Elem

      active: false,
      selected: false,

      // Region

      noteIds: computed(() => this.react.collab.noteIds),
      arrowIds: computed(() => this.react.collab.arrowIds),

      notes: computed(() => this.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.arrows.fromIds(this.react.arrowIds)),
    });

    this.collab = factory.makeCollab(this);

    this.pos = factory.makePos(this);
    this.rects = factory.makeRects(this);
    this.sizes = factory.makeSizes(this);

    this.camera = factory.makeCamera(this);
    this.panning = factory.makePanning(this);
    this.zooming = factory.makeZooming(this);

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
  }

  async preSync() {
    // Request page data

    const response = await $api.post<IPageData>('/api/pages/data', {
      pageId: this.id,
    });

    // Update path page data

    this.app.react.dict[`pageGroupId.${this.id}`] = response.data.groupId;
    this.app.react.dict[`groupOwnerId.${response.data.groupId}`] =
      response.data.ownerId;
    this.app.react.dict[`groupRoleId.${response.data.groupId}`] =
      response.data.roleId;

    // Save page values

    this.groupId = response.data.groupId;
    this.ownerId = response.data.ownerId;
    this.roleId = response.data.roleId;

    this.react.userStatus = response.data.userStatus;

    // Check if has permission

    if (response.data.encryptedSymmetricKey == null) {
      this.react.loaded = true;
      this.react.hasPermission = false;
      return;
    }

    // Decrypt symmetric key

    const decryptedSymmetricKey = privateKey.decrypt(
      from_base64(response.data.encryptedSymmetricKey),
      from_base64(response.data.distributorsPublicKey)
    );

    const symmetricKey = createSymmetricKey(decryptedSymmetricKey);

    // Setup websocket

    const roomName = `page.${this.id}`;

    this.collab.websocketProvider = new WebsocketProvider(
      process.env.DEV
        ? 'ws://192.168.1.2:33245'
        : 'wss://yjs-server.deepnotes.app/',
      roomName,
      this.collab.doc,
      symmetricKey
    );

    await Promise.all([
      this.app.realtime.synced,

      this.collab.websocketProvider.synced,
    ]);

    return response.data;
  }

  postSync(pageData: IPageData) {
    if (this.collab.store.page.nextZIndex == null) {
      this.collab.reset();
    }

    this.elems.setup();

    this.camera.setup(pageData.camera);

    this.react.size = this.collab.websocketProvider.size;

    this.react.loaded = true;
  }

  async setup() {
    const pageData = await this.preSync();

    if (pageData != null) {
      this.postSync(pageData);
    }
  }
}
