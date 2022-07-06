import type { Editor } from '@tiptap/vue-3';
import { watchUntilTrue } from 'src/code/pages/static/vue';
import {
  computed,
  ComputedRef,
  nextTick,
  reactive,
  UnwrapNestedRefs,
} from 'vue';

import { AppPage } from '../page';
import { NoteTextSection, PageNote } from './note';

export interface IEditingReact {
  noteId: string | null;

  note: ComputedRef<PageNote | null>;
  section?: NoteTextSection;
  editor: ComputedRef<Editor | null>;

  active: ComputedRef<boolean>;
}

export class PageEditing {
  readonly react: UnwrapNestedRefs<IEditingReact>;

  constructor(readonly page: AppPage) {
    this.react = reactive({
      noteId: null,

      note: computed(() => this.page.notes.fromId(this.react.noteId)),
      editor: computed(
        () => this.react.note?.react[this.react.section!].editor ?? null
      ),

      active: computed(() => this.react.note != null),
    });
  }

  async start(note: PageNote, section?: NoteTextSection) {
    if (this.react.noteId === note.id) {
      return;
    }

    if (this.react.active) {
      this.stop();
    }

    if (this.page.react.readonly || note.react.collab.readOnly) {
      return;
    }

    note.react.editing = true;

    this.react.noteId = note.id;

    if (section != null) {
      this.react.section = section;
    } else if (note.react.topSection !== 'container') {
      this.react.section = note.react.topSection;
    }

    this.page.selection.set(note);

    await nextTick();
    await watchUntilTrue(() => note.react.loaded);

    if (this.react.note != null) {
      for (const editor of this.react.note.react.editors) {
        editor.setEditable(true);
      }
    }

    this.react.editor?.commands.focus('all');
  }

  stop() {
    if (this.react.note == null) {
      return;
    }

    for (const editor of this.react.note.react.editors) {
      editor.setEditable(false);
    }

    this.react.note.react.editing = false;

    this.react.noteId = null;
  }
}
