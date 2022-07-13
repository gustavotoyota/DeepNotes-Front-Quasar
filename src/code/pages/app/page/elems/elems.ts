import { AppPage } from '../page';

export class PageElems {
  constructor(readonly page: AppPage) {}

  setup() {
    this.page.layers.createAndObserveIds(
      this.page.react.collab.layerIds,
      this.page.id
    );

    for (const layer of this.page.react.layers) {
      this.page.notes.createAndObserveIds(layer.react.collab.noteIds, layer.id);

      this.page.arrows.createAndObserveIds(layer.react.collab.arrowIds);
    }

    this.page.layers.observeMap();
    this.page.notes.observeMap();
    this.page.arrows.observeMap();
  }
}
