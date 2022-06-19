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
import { computed } from '@vue/reactivity';
import { NoteTextSection, PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, onBeforeUnmount, onMounted, watch } from 'vue';
import * as Y from 'yjs';

const EditorContent = tiptap.EditorContent;

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

const editor = tiptap.useEditor({
  content: value instanceof Y.XmlFragment ? undefined : value,
  editable: false,
  extensions: [
    ...tiptap.extensions,
    ...(value instanceof Y.XmlFragment
      ? [
          tiptap.Collaboration.configure({
            fragment: value,
          }),
          tiptap.CollaborationCursor.configure({
            provider: page.collab.websocketProvider,
            user: {
              name: 'Cyndi Lauper',
              color: '#f783ac',
            },
          }),
        ]
      : []),
  ],

  onFocus() {
    page.editing.react.section = props.section;
  },
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

  p {
    margin-bottom: 0;
  }

  table {
    border-collapse: collapse;

    td,
    th {
      border: 1px solid #ccc;

      padding: 2px 5px;

      vertical-align: top;

      position: relative;
    }
    th {
      font-weight: unset;
      text-align: unset;
    }

    .selectedCell:after {
      background: rgba(200, 200, 255, 0.4);
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: #adf;
      bottom: -2px;
      position: absolute;
      right: -2px;
      pointer-events: none;
      top: 0;
      width: 4px;
    }
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  ul,
  ol {
    margin: 0;
  }
  ul {
    padding-inline-start: 22px;

    & > li > * {
      margin-left: -4px;
    }
  }
  ol {
    padding-inline-start: 18px;
  }

  h1,
  h2,
  h3 {
    font-weight: 700;

    line-height: unset;
    margin-block: 0;

    letter-spacing: unset;
  }
  h1 {
    font-size: 2em;
  }
  h2 {
    font-size: 1.5em;
  }
  h3 {
    font-size: 1.25em;
  }

  hr {
    margin-top: 7px;

    border: none;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.35);
  }

  .collaboration-cursor__caret {
    position: relative;

    border-left: 1px solid #ffa500;
    border-right: 1px solid #ffa500;

    margin-left: -1px;
    margin-right: -1px;

    pointer-events: none;
  }
  .collaboration-cursor__label {
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
}
div.padding-fix :deep(.ProseMirror) {
  padding-right: 0;
}
div.no-wrap :deep(.ProseMirror) {
  white-space: nowrap;
}
</style>
