<template>
  <NodeViewWrapper
    as="span"
    class="image-wrapper"
  >
    <img
      ref="imageElem"
      v-bind="node.attrs"
      draggable="true"
      data-drag-handle
    />

    <div
      class="resize-handle"
      @pointerdown.stop="onResizeHandlePointerDown"
      :style="{
        transform: `scale(${1 / $pages.react.page.camera.react.zoom})`,
      }"
    ></div>
  </NodeViewWrapper>
</template>

<script
  setup
  lang="ts"
>
import { Editor, NodeViewWrapper } from '@tiptap/vue-3';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Decoration } from 'prosemirror-view';
import { listenPointerEvents } from 'src/code/lib/dom';
import { ref } from 'vue';

const props = defineProps<{
  editor: Editor;
  node: ProseMirrorNode;
  decorations: Decoration[];
  selected: boolean;
  extension: Node;
  getPos: () => number;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
}>();

const imageElem = ref<Element>();

let startWidth: number;
let startPos: number;

function onResizeHandlePointerDown(event: PointerEvent) {
  startWidth = imageElem.value!.clientWidth;
  startPos = event.clientX;

  listenPointerEvents(event, {
    move: onPointerMove,
  });
}
function onPointerMove(event: PointerEvent) {
  props.updateAttributes({
    width:
      startWidth +
      (event.clientX - startPos) / $pages.react.page.camera.react.zoom,
  });
}
</script>

<style
  lang="scss"
  scoped
>
.image-wrapper {
  display: inline-flex;
  flex-grow: 0;

  position: relative;

  > .resize-handle {
    position: absolute;

    border: 1px solid #3259a5;
    border-radius: 9999px;

    right: -6px;
    bottom: -6px;
    width: 12px;
    height: 12px;

    background-color: white;

    transition: opacity 0.3s ease;

    opacity: 0;
  }

  &:hover > .resize-handle {
    opacity: 1;
  }
}
</style>
