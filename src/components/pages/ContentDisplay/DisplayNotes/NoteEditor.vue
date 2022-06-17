<template>
  <editor-content
    :editor="editor"
    :class="{
      'padding-fix': paddingFix,
      'no-wrap': !note.collab[props.section].wrap,
    }"
  />
</template>

<script
  setup
  lang="ts"
>
import { Y } from '@syncedstore/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { computed } from '@vue/reactivity';
import { NoteTextSection, PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { TiptapExtensions } from 'src/code/pages/static/tiptap';
import { inject, onBeforeUnmount, onMounted, watch } from 'vue';

const props = defineProps<{
  section: NoteTextSection;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

// Collapsed padding fix

const paddingFix = computed(
  () =>
    note.collab.collapsing.enabled && props.section === note.react.topSection
);

const value = note.collab[props.section].value;

const editor = useEditor({
  content: value instanceof Y.XmlFragment ? undefined : value,
  editable: false,
  extensions: [
    ...TiptapExtensions,
    ...(value instanceof Y.XmlFragment
      ? [
          Collaboration.configure({
            fragment: value,
          }),
          CollaborationCursor.configure({
            provider: page.collab.websocketProvider,
            user: {
              name: 'Cyndi Lauper',
              color: '#f783ac',
            },
          }),
        ]
      : []),
  ],
});

let unwatch: () => void;

onMounted(() => {
  note.react[props.section].editor = editor.value!;

  unwatch = watch(
    () => note.react.editing,
    () => {
      editor.value?.setEditable(note.react.editing);

      if (note.react.editing && props.section === page.editing.react.section) {
        editor.value?.commands.focus('all');
      }
    },
    { immediate: true }
  );
});

onBeforeUnmount(() => {
  unwatch();

  note.react[props.section].editor = null;
});
</script>

<style
  scoped
  lang="scss"
>
div {
  height: 100%;
}

div :deep(.ProseMirror) {
  padding: 9px;

  outline: none;

  font-size: 13px;

  height: 100%;

  overflow: auto;

  touch-action: pan-x pan-y !important;
}
div.padding-fix :deep(.ProseMirror) {
  padding-right: 0;
}
div.no-wrap :deep(.ProseMirror) {
  white-space: nowrap;
}

div :deep(.ProseMirror p) {
  margin-bottom: 0;
}

div :deep(.ProseMirror ul) {
  margin: 0;
  padding-inline-start: 22px;
}
div :deep(.ProseMirror li > *) {
  margin-left: -4px;
}

div :deep(.ProseMirror .collaboration-cursor__caret) {
  position: relative;

  border-left: 1px solid #ffa500;
  border-right: 1px solid #ffa500;

  margin-left: -1px;
  margin-right: -1px;

  pointer-events: none;
}
div :deep(.ProseMirror .collaboration-cursor__label) {
  position: absolute;
  white-space: nowrap;

  border-radius: 3px;
  border-bottom-left-radius: 0px;

  padding: 0px 3px;

  left: -1px;
  top: 0px;

  transform: translateY(-100%);

  font-size: 12px;
}
</style>
