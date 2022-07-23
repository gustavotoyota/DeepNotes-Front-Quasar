import {
  IArrowCollabOutput,
  PageArrow,
} from 'src/code/app/pages/page/arrows/arrow';
import { PageArrowCreation } from 'src/code/app/pages/page/arrows/arrow-creation';
import { PageArrows } from 'src/code/app/pages/page/arrows/arrows';
import { PageCamera } from 'src/code/app/pages/page/camera/camera';
import { PagePanning } from 'src/code/app/pages/page/camera/panning';
import { PagePinching } from 'src/code/app/pages/page/camera/pinching';
import { PageZooming } from 'src/code/app/pages/page/camera/zooming';
import { PageCollab } from 'src/code/app/pages/page/collab';
import { PageClipboard } from 'src/code/app/pages/page/elems/clipboard';
import { PageDeleting } from 'src/code/app/pages/page/elems/deleting';
import { PageElems } from 'src/code/app/pages/page/elems/elems';
import { PageLayer } from 'src/code/app/pages/page/layers/layer';
import { PageLayers } from 'src/code/app/pages/page/layers/layers';
import { PageCloning } from 'src/code/app/pages/page/notes/cloning';
import { PageDragging } from 'src/code/app/pages/page/notes/dragging';
import { PageDropping } from 'src/code/app/pages/page/notes/dropping';
import { PageEditing } from 'src/code/app/pages/page/notes/editing';
import {
  INoteCollabOutput,
  PageNote,
} from 'src/code/app/pages/page/notes/note';
import { PageNotes } from 'src/code/app/pages/page/notes/notes';
import { PageResizing } from 'src/code/app/pages/page/notes/resizing';
import { AppPage } from 'src/code/app/pages/page/page';
import { PageRegions } from 'src/code/app/pages/page/regions/regions';
import { PageActiveElem } from 'src/code/app/pages/page/selection/active-elem';
import { PageActiveRegion } from 'src/code/app/pages/page/selection/active-region';
import { PageBoxSelection } from 'src/code/app/pages/page/selection/box-selection';
import { PageClickSelection } from 'src/code/app/pages/page/selection/click-selection';
import { PageSelection } from 'src/code/app/pages/page/selection/selection';
import { PagePos } from 'src/code/app/pages/page/space/pos';
import { PageRects } from 'src/code/app/pages/page/space/rects';
import { PageSizes } from 'src/code/app/pages/page/space/sizes';
import { PageUndoRedo } from 'src/code/app/pages/page/undo-redo';
import { AppPageCache } from 'src/code/app/pages/page-cache';
import { PagesApp } from 'src/code/app/pages/pages';
import { AppRealtime } from 'src/code/app/pages/realtime';
import { AppSerialization } from 'src/code/app/pages/serialization';
import { Container } from 'src/code/lib/simple-di';

export const container = new Container({
  app: (factory: any) => () => new PagesApp(factory),

  serialization: () => (app: PagesApp) => new AppSerialization(app),
  pageCache: () => (app: PagesApp) => new AppPageCache(app),
  realtime: () => (url: string) => new AppRealtime(url),

  page: (factory: any) => (app: PagesApp, id: string) =>
    new AppPage(factory, app, id),

  collab: () => (page: AppPage) => new PageCollab(page),
  undoRedo: () => (page: AppPage) => new PageUndoRedo(page),

  pos: () => (page: AppPage) => new PagePos(page),
  rects: () => (page: AppPage) => new PageRects(page),
  sizes: () => (page: AppPage) => new PageSizes(page),

  camera: () => (page: AppPage) => new PageCamera(page),
  panning: () => (page: AppPage) => new PagePanning(page),
  zooming: () => (page: AppPage) => new PageZooming(page),
  pinching: () => (page: AppPage) => new PagePinching(page),

  selection: () => (page: AppPage) => new PageSelection(page),
  activeElem: () => (page: AppPage) => new PageActiveElem(page),
  activeRegion: () => (page: AppPage) => new PageActiveRegion(page),
  clickSelection: () => (page: AppPage) => new PageClickSelection(page),
  boxSelection: () => (page: AppPage) => new PageBoxSelection(page),

  layers: (factory: any) => (page: AppPage) => new PageLayers(factory, page),
  layer: () => (page: AppPage, id: string, regionId: string) =>
    new PageLayer(page, id, regionId),

  regions: () => (page: AppPage) => new PageRegions(page),

  elems: () => (page: AppPage) => new PageElems(page),
  deleting: () => (page: AppPage) => new PageDeleting(page),
  clipboard: () => (page: AppPage) => new PageClipboard(page),

  notes: (factory: any) => (page: AppPage) => new PageNotes(factory, page),
  note:
    () =>
    (page: AppPage, id: string, index: number, collab?: INoteCollabOutput) =>
      new PageNote(page, id, index, collab),
  editing: () => (page: AppPage) => new PageEditing(page),
  dragging: () => (page: AppPage) => new PageDragging(page),
  dropping: () => (page: AppPage) => new PageDropping(page),
  cloning: () => (page: AppPage) => new PageCloning(page),
  resizing: (factory: any) => (page: AppPage) =>
    new PageResizing(factory, page),

  arrows: (factory: any) => (page: AppPage) => new PageArrows(factory, page),
  arrow:
    () =>
    (page: AppPage, id: string, index: number, collab?: IArrowCollabOutput) =>
      new PageArrow(page, id, index, collab),
  arrowCreation: (factory: any) => (page: AppPage) =>
    new PageArrowCreation(factory, page),
});

export const factory = container.factory;
export type Factory = typeof factory;

export const dependencies = container.dependencies;
export type Dependencies = typeof dependencies;
