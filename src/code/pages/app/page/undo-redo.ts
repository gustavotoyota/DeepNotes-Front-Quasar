import { computed, reactive } from 'vue';
import * as Y from 'yjs';

import { AppPage } from './page';

export class PageUndoRedo {
  undoManager!: Y.UndoManager;

  readonly react = reactive({
    key: 0,

    canUndo: computed(() => {
      this.react.key;
      return this.undoManager.canUndo() ?? false;
    }),
    canRedo: computed(() => {
      this.react.key;
      return this.undoManager.canRedo() ?? false;
    }),
  });

  constructor(readonly page: AppPage) {
    this.page = page;
  }

  setup() {
    this.undoManager = new Y.UndoManager([
      syncedstore.getYjsValue(
        this.page.collab.store.page
      ) as Y.AbstractType<any>,
      syncedstore.getYjsValue(
        this.page.collab.store.layers
      ) as Y.AbstractType<any>,
      syncedstore.getYjsValue(
        this.page.collab.store.notes
      ) as Y.AbstractType<any>,
      syncedstore.getYjsValue(
        this.page.collab.store.arrows
      ) as Y.AbstractType<any>,
    ]);

    this.undoManager.on('stack-cleared', this.updateReactiveData);
    this.undoManager.on('stack-item-added', this.updateReactiveData);
    this.undoManager.on('stack-item-popped', this.updateReactiveData);
    this.undoManager.on('stack-item-updated', this.updateReactiveData);
  }

  resetCapturing() {
    this.undoManager.stopCapturing();
  }

  undo() {
    this.page.selection.clear();

    this.undoManager.undo();

    this.updateReactiveData();
  }
  redo() {
    this.page.selection.clear();

    this.undoManager.redo();

    this.updateReactiveData();
  }

  updateReactiveData = () => {
    this.react.key++;
  };

  skip(func: () => void) {
    const oldTrackedOrigins = this.undoManager.trackedOrigins;

    this.undoManager.trackedOrigins = new Set();

    func();

    this.undoManager.trackedOrigins = oldTrackedOrigins;
  }
}
