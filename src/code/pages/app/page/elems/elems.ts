import { AppPage } from '../page';

export class PageElems {
  constructor(readonly page: AppPage) {}

  setup() {
    this.page.layers.createAndObserveIds(this.page.react.collab.layerIds);

    for (const layer of this.page.react.layers) {
      this.page.notes.createAndObserveIds(layer.collab.noteIds, layer.id, null);

      this.page.arrows.createAndObserveIds(
        layer.collab.arrowIds,
        layer.id,
        null
      );
    }

    this.page.layers.observeMap();
    this.page.notes.observeMap();
    this.page.arrows.observeMap();
  }
}
