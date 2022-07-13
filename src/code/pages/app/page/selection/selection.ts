import { ChainedCommands } from '@tiptap/vue-3';
import { MarkName } from 'src/code/pages/static/tiptap';
import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';

import { PageArrow } from '../arrows/arrow';
import { PageElem } from '../elems/elem';
import { PageLayer } from '../layers/layer';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface ISelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;

  elems: ComputedRef<(PageNote | PageArrow)[]>;
}

export class PageSelection {
  readonly react: UnwrapNestedRefs<ISelectionReact>;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      noteSet: {},
      arrowSet: {},

      noteIds: computed(() => Object.keys(this.react.noteSet)),
      arrowIds: computed(() => Object.keys(this.react.arrowSet)),

      notes: computed(() => this.page.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.page.arrows.fromIds(this.react.arrowIds)),

      elems: computed(() =>
        (this.react.notes as (PageNote | PageArrow)[]).concat(this.react.arrows)
      ),
    });
  }

  has(elem: PageElem): boolean {
    if (elem.type == null) {
      return false;
    }

    return elem.id in this.react[`${elem.type}Set`];
  }

  clear(region?: AppPage | PageNote) {
    for (const elem of this.react.elems) {
      this.remove(elem);
    }

    this.react.noteSet = {};
    this.react.arrowSet = {};

    this.page.activeElem.clear();

    if (region !== undefined) {
      this.page.activeRegion.react.id = region.id;
    }
  }

  add(...elems: PageElem[]) {
    this.page.collab.doc.transact(() => {
      for (const elem of elems) {
        if (elem.react.selected || elem.type == null) {
          continue;
        }

        if (elem.react.region !== this.page.activeRegion.react.region) {
          this.clear(elem.react.region);
        }

        elem.react.selected = true;
        this.react[`${elem.type}Set`][elem.id] = true;

        if (!this.page.activeElem.react.exists) {
          this.page.activeElem.set(elem);
        }

        if (elem instanceof PageNote) {
          elem.bringToTop();
        }
      }
    });
  }
  remove(...elems: PageElem[]) {
    for (const elem of elems) {
      if (!elem.react.selected || elem.type == null) {
        continue;
      }

      elem.react.selected = false;
      delete this.react[`${elem.type}Set`][elem.id];

      if (elem.react.active) {
        this.page.activeElem.set(this.react.elems.at(-1) ?? null);
      }
    }
  }

  set(...elems: PageElem[]) {
    this.page.collab.doc.transact(() => {
      this.clear();

      this.add(...elems);
    });
  }

  selectAll() {
    this.add(...this.page.activeRegion.react.region.react.elems);
  }

  shift(shiftX: number, shiftY: number) {
    this.page.collab.doc.transact(() => {
      for (const note of this.react.notes) {
        note.react.collab.pos.x += shiftX;
        note.react.collab.pos.y += shiftY;
      }
    });
  }

  isMarkActive(name: MarkName) {
    for (const elem of this.react.elems) {
      if (!elem.isMarkActive(name)) {
        return false;
      }
    }

    return true;
  }
  setMark(name: MarkName, attribs?: Record<string, any>) {
    this.page.collab.doc.transact(() => {
      for (const elem of this.react.elems) {
        elem.setMark(name, attribs);
      }
    });
  }
  unsetMark(name: MarkName) {
    this.page.collab.doc.transact(() => {
      for (const elem of this.react.elems) {
        elem.unsetMark(name);
      }
    });
  }
  toggleMark(name: MarkName, attribs?: Record<string, any>) {
    this.page.collab.doc.transact(() => {
      if (this.isMarkActive(name)) {
        this.unsetMark(name);
      } else {
        this.setMark(name, attribs);
      }
    });
  }

  format(chainFunc: (chain: ChainedCommands) => ChainedCommands) {
    this.page.collab.doc.transact(() => {
      for (const elem of this.react.elems) {
        elem.format(chainFunc);
      }
    });
  }

  moveToLayer(layer: PageLayer, insertIndex?: number) {
    const notesSet = new Set(this.react.notes);
    const arrowsSet = new Set<PageArrow>();

    for (const note of this.react.notes) {
      for (const arrow of this.page.arrows.fromIds(
        Array.from(note.incomingArrowIds)
      )) {
        if (notesSet.has(arrow.react.sourceNote)) {
          arrowsSet.add(arrow);
        }
      }

      for (const arrow of this.page.arrows.fromIds(
        Array.from(note.outgoingArrowIds)
      )) {
        if (notesSet.has(arrow.react.targetNote)) {
          arrowsSet.add(arrow);
        }
      }
    }

    const notesArray = Array.from(notesSet);
    const arrowsArray = Array.from(arrowsSet);

    notesArray.sort((a, b) => b.react.index - a.react.index);
    arrowsArray.sort((a, b) => b.react.index - a.react.index);

    insertIndex ??= layer.react.collab.noteIds.length;

    this.page.collab.doc.transact(() => {
      for (const note of notesArray) {
        note.moveToLayer(layer, insertIndex);
      }

      for (const arrow of arrowsArray) {
        arrow.moveToLayer(layer);
      }
    });

    this.page.activeRegion.react.id = layer.react.region.id;

    this.add(...notesArray, ...arrowsArray);
  }
}
