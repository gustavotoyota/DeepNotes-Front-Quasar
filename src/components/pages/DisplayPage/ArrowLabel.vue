<template>
  <editor-content
    :editor="editor"
    class="arrow-label"
    :style="{
      left: `${arrow.react.centerPos.x}px`,
      top: `${arrow.react.centerPos.y}px`,
    }"
    @pointerdown.left.stop="onLeftPointerDown"
    @dblclick.left="onLeftDoubleClick"
  />
</template>

<script
  setup
  lang="ts"
>
import { internals } from 'src/code/app/internals';
import { PageArrow } from 'src/code/app/pages/page/arrows/arrow';
import { AppPage } from 'src/code/app/pages/page/page';
import { REALTIME_USER_DISPLAY_NAME } from 'src/code/app/pages/realtime';
import { inject } from 'vue';
import * as Y from 'yjs';

const props = defineProps<{
  arrow: PageArrow;
}>();

const page = inject<AppPage>('page')!;
// eslint-disable-next-line vue/no-setup-props-destructure
const arrow = props.arrow;

arrow.react.loaded = false;

const EditorContent = internals.tiptap.EditorContent;

// eslint-disable-next-line vue/no-setup-props-destructure
const value = props.arrow.react.collab.label;

const editor = internals.tiptap.useEditor({
  content: value instanceof Y.XmlFragment ? undefined : value,

  editable: false,

  extensions: [
    ...internals.tiptap.arrowExtensions,

    ...(value instanceof Y.XmlFragment
      ? [
          internals.tiptap.Collaboration.configure({
            fragment: value,
          }),
          internals.tiptap.CollaborationCursor.configure({
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
    arrow.react.editor = editor;

    arrow.react.loaded = true;
  },
  onDestroy() {
    arrow.react.editor = null;

    arrow.react.loaded = true;
  },
});

function onLeftPointerDown(event: PointerEvent) {
  page.clickSelection.perform(props.arrow, event);
}

async function onLeftDoubleClick() {
  await page.editing.start(arrow);
}
</script>

<style
  scoped
  lang="scss"
>
.arrow-label {
  position: absolute;

  transform: translate(-50%, -50%);

  :deep(.ProseMirror) {
    outline: none;

    padding: 9px;

    width: max-content;

    font-size: 13px;

    p {
      margin-bottom: 0;
    }

    a {
      color: #81d4fa;
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
      border-top-left-radius: 0px;

      padding: 0px 3px;

      left: -1px;
      bottom: 0px;

      transform: translateY(100%);

      font-size: 12px;

      z-index: 2147483647;
    }
  }
}
</style>
