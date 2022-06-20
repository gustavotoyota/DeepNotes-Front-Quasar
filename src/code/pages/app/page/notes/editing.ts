import { Editor } from '@tiptap/vue-3';
import { refProp, watchUntilTrue } from 'src/code/pages/static/vue';
import { computed, ComputedRef, nextTick, UnwrapRef } from 'vue';

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
  readonly page: AppPage;

  react: UnwrapRef<IEditingReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IEditingReact>(this, 'react', {
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

    if (this.page.react.readonly || note.collab.readOnly) {
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

    await watchUntilTrue(
      () => this.page.react.allEditorsLoaded,
      () => {
        if (!this.page.react.allEditorsLoaded) {
          return false;
        }

        this.react.editor!.setEditable(note.react.editing);
        this.react.editor!.commands.focus('all');

        return true;
      },
      { immediate: true }
    );
  }

  stop() {
    if (this.react.note == null) {
      return;
    }

    this.react.editor!.setEditable(false);

    this.react.note.react.editing = false;

    this.react.noteId = null;
  }
}
