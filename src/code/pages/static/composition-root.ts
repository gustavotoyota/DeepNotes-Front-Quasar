import { z } from 'zod';

import { PagesApp } from '../app/app';
import { PageArrow } from '../app/page/arrows/arrow';
import { PageArrowCreation } from '../app/page/arrows/arrow-creation';
import { PageArrows } from '../app/page/arrows/arrows';
import { PageCamera } from '../app/page/camera/camera';
import { PagePanning } from '../app/page/camera/panning';
import { PagePinching } from '../app/page/camera/pinching';
import { PageZooming } from '../app/page/camera/zooming';
import { PageCollab } from '../app/page/collab';
import { PageClipboard } from '../app/page/elems/clipboard';
import { PageDeleting } from '../app/page/elems/deleting';
import { PageElems } from '../app/page/elems/elems';
import { PageLayer } from '../app/page/layers/layer';
import { PageLayers } from '../app/page/layers/layers';
import { PageCloning } from '../app/page/notes/cloning';
import { PageDragging } from '../app/page/notes/dragging';
import { PageDropping } from '../app/page/notes/dropping';
import { PageEditing } from '../app/page/notes/editing';
import { INoteCollab, PageNote } from '../app/page/notes/note';
import { PageNotes } from '../app/page/notes/notes';
import { PageResizing } from '../app/page/notes/resizing';
import { AppPage } from '../app/page/page';
import { PageRegions } from '../app/page/regions/regions';
import { PageActiveElem } from '../app/page/selection/active-elem';
import { PageActiveRegion } from '../app/page/selection/active-region';
import { PageBoxSelection } from '../app/page/selection/box-selection';
import { PageClickSelection } from '../app/page/selection/click-selection';
import { PageSelection } from '../app/page/selection/selection';
import { PagePos } from '../app/page/space/pos';
import { PageRects } from '../app/page/space/rects';
import { PageSizes } from '../app/page/space/sizes';
import { PageUndoRedo } from '../app/page/undo-redo';
import { AppPageCache } from '../app/page-cache';
import { AppRealtime } from '../app/realtime';
import { AppSerialization } from '../app/serialization';
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
  layer: () => (page: AppPage, id: string) => new PageLayer(page, id),

  regions: () => (page: AppPage) => new PageRegions(page),

  elems: () => (page: AppPage) => new PageElems(page),
  deleting: () => (page: AppPage) => new PageDeleting(page),
  clipboard: () => (page: AppPage) => new PageClipboard(page),

  notes: (factory: any) => (page: AppPage) => new PageNotes(factory, page),
  note:
    () =>
    (
      page: AppPage,
      id: string,
      layerId: string,
      parentId: string | null,
      index: number,
      collab?: z.output<typeof INoteCollab>
    ) =>
      new PageNote(page, id, layerId, parentId, index, collab),
  editing: () => (page: AppPage) => new PageEditing(page),
  dragging: () => (page: AppPage) => new PageDragging(page),
  dropping: () => (page: AppPage) => new PageDropping(page),
  cloning: () => (page: AppPage) => new PageCloning(page),
  resizing: (factory: any) => (page: AppPage) =>
    new PageResizing(factory, page),

  arrows: (factory: any) => (page: AppPage) => new PageArrows(factory, page),
  arrow:
    () =>
    (
      page: AppPage,
      id: string,
      layerId: string,
      parentId: string | null,
      index: number,
      fake = false
    ) =>
      new PageArrow(page, id, layerId, parentId, index, fake),
  arrowCreation: (factory: any) => (page: AppPage) =>
    new PageArrowCreation(factory, page),
});

export const factory = container.factory;
export type Factory = typeof factory;

export const dependencies = container.dependencies;
export type Dependencies = typeof dependencies;
