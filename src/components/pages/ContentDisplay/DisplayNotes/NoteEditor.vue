<template>
  <editor-content
    :editor="editor"
    :class="{
      'padding-fix': paddingFix,
      'no-wrap': !note.react.collab[props.section].wrap,
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
import { REALTIME_USER_DISPLAY_NAME } from 'src/code/pages/app/realtime';
import { inject } from 'vue';
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
    note.react.collab.collapsing.enabled &&
    props.section === note.react.topSection
);

// Setup Tiptap editor

let loading = true;

note.react.numEditorsLoading++;
page.react.numEditorsLoading++;

note.react.allEditorsLoaded = false;

function finishLoading() {
  if (!loading) {
    return;
  }

  loading = false;

  note.react.numEditorsLoading--;
  page.react.numEditorsLoading--;

  if (note.react.numEditorsLoading === 0) {
    note.react.allEditorsLoaded = true;
  }
}

const value = note.react.collab[props.section].value;

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
              name: $pages.realtime.get(
                REALTIME_USER_DISPLAY_NAME,
                $pages.react.userId
              ),
              color: '#f783ac',
            },
          }),
        ]
      : []),
  ],

  onCreate({ editor }) {
    // @ts-ignore
    note.react[props.section].editor = editor;

    editor.setEditable(note.react.editing);

    finishLoading();
  },
  onDestroy() {
    note.react[props.section].editor = null;

    finishLoading();
  },

  onFocus() {
    page.editing.react.section = props.section;
  },
});
</script>

<style
  scoped
  lang="scss"
>
div {
  height: 100%;
}

$note-padding: 9px;

div :deep(.ProseMirror) {
  outline: none;

  overflow: auto;

  padding: $note-padding;
  padding-bottom: $note-padding - 1px;

  width: max-content;
  min-width: MAX(100%, 1px + $note-padding * 2);
  max-width: 100%;

  height: 100%;

  font-size: 13px;

  touch-action: pan-x pan-y !important;

  p {
    margin-bottom: 0;
  }

  table {
    margin: 7px 0;

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
  ul:not([data-type]) {
    padding-inline-start: 21px;

    > li > * {
      margin-left: -3px;
    }
  }
  ol {
    padding-inline-start: 18px;
  }

  ul[data-type='taskList'] {
    padding-inline-start: 22px;

    padding: 0;

    li {
      display: flex;

      > label {
        flex: 0 0 auto;
        margin-right: 5px;
        user-select: none;

        > input {
          position: relative;
          top: 2px;
        }
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }

  code:not(pre > code) {
    border-radius: 0.3em;

    box-decoration-break: clone;

    padding: 0.25em;

    color: #fff;

    background: #181818;
  }

  pre {
    margin: 5px 0;
    border-radius: 0.4rem;
    padding: 0.4rem 0.5rem;

    background: #181818;
  }

  h1,
  h2,
  h3 {
    font-weight: 700;

    line-height: unset;

    margin-block-start: 0;
    margin-block-end: 0;

    letter-spacing: unset;
  }
  h1 {
    font-size: 2em;
  }
  h2 {
    font-size: 1.5em;
  }
  h3 {
    font-size: 1.17em;
  }

  hr {
    margin: 9px 0;

    border: none;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.35);
  }

  blockquote {
    margin: 4px 0;

    border-left: 5px solid rgba(#fff, 0.5);

    padding-left: 1.3rem;
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
