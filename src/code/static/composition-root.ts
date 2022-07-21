import { IArrowCollabOutput, PageArrow } from '../pages/page/arrows/arrow';
import { PageArrowCreation } from '../pages/page/arrows/arrow-creation';
import { PageArrows } from '../pages/page/arrows/arrows';
import { PageCamera } from '../pages/page/camera/camera';
import { PagePanning } from '../pages/page/camera/panning';
import { PagePinching } from '../pages/page/camera/pinching';
import { PageZooming } from '../pages/page/camera/zooming';
import { PageCollab } from '../pages/page/collab';
import { PageClipboard } from '../pages/page/elems/clipboard';
import { PageDeleting } from '../pages/page/elems/deleting';
import { PageElems } from '../pages/page/elems/elems';
import { PageLayer } from '../pages/page/layers/layer';
import { PageLayers } from '../pages/page/layers/layers';
import { PageCloning } from '../pages/page/notes/cloning';
import { PageDragging } from '../pages/page/notes/dragging';
import { PageDropping } from '../pages/page/notes/dropping';
import { PageEditing } from '../pages/page/notes/editing';
import { INoteCollabOutput, PageNote } from '../pages/page/notes/note';
import { PageNotes } from '../pages/page/notes/notes';
import { PageResizing } from '../pages/page/notes/resizing';
import { AppPage } from '../pages/page/page';
import { PageRegions } from '../pages/page/regions/regions';
import { PageActiveElem } from '../pages/page/selection/active-elem';
import { PageActiveRegion } from '../pages/page/selection/active-region';
import { PageBoxSelection } from '../pages/page/selection/box-selection';
import { PageClickSelection } from '../pages/page/selection/click-selection';
import { PageSelection } from '../pages/page/selection/selection';
import { PagePos } from '../pages/page/space/pos';
import { PageRects } from '../pages/page/space/rects';
import { PageSizes } from '../pages/page/space/sizes';
import { PageUndoRedo } from '../pages/page/undo-redo';
import { AppPageCache } from '../pages/page-cache';
import { PagesApp } from '../pages/pages';
import { AppRealtime } from '../pages/realtime';
import { AppSerialization } from '../pages/serialization';
import { Container } from './simple-di';

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
