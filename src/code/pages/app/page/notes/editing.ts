import type { Editor } from '@tiptap/vue-3';
import { watchUntilTrue } from 'src/code/pages/static/vue';
import {
  computed,
  ComputedRef,
  nextTick,
  reactive,
  UnwrapNestedRefs,
} from 'vue';

import { PageArrow } from '../arrows/arrow';
import { AppPage } from '../page';
import { NoteTextSection, PageNote } from './note';

export interface IEditingReact {
  elemId: string | null;

  elem: ComputedRef<PageNote | PageArrow | null>;
  section?: NoteTextSection;
  editor: ComputedRef<Editor | null>;

  active: ComputedRef<boolean>;
}

export class PageEditing {
  readonly react: UnwrapNestedRefs<IEditingReact>;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      elemId: null,

      elem: computed(
        () =>
          this.page.notes.fromId(this.react.elemId) ??
          this.page.arrows.fromId(this.react.elemId)
      ),
      editor: computed(() => {
        if (this.react.elem == null) {
          return null;
        } else if (this.react.elem instanceof PageNote) {
          return this.react.elem.react[this.react.section!].editor;
        } else {
          return this.react.elem.react.editor;
        }
      }),

      active: computed(() => this.react.elem != null),
    });
  }

  async start(elem: PageNote | PageArrow, section?: NoteTextSection) {
    if (this.react.elemId === elem.id) {
      return;
    }

    if (this.react.active) {
      this.stop();
    }

    if (this.page.react.readonly || elem.react.collab.readOnly) {
      return;
    }

    elem.react.editing = true;

    this.react.elemId = elem.id;

    if (elem instanceof PageNote) {
      if (section != null) {
        this.react.section = section;
      } else if (elem.react.topSection !== 'container') {
        this.react.section = elem.react.topSection;
      }
    }

    await nextTick();
    await watchUntilTrue(() => elem.react.loaded);

    this.page.selection.set(elem);

    for (const editor of elem.react.editors) {
      editor.setEditable(true);
    }

    this.react.editor?.commands.focus('all');
  }

  stop() {
    if (this.react.elem == null) {
      return;
    }

    for (const editor of this.react.elem.react.editors) {
      editor.setEditable(false);
    }

    this.react.elem.react.editing = false;

    this.react.elemId = null;
  }
}
