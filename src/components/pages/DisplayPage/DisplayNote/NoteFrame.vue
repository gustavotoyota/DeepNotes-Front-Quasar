<template>
  <div
    class="note-frame"
    ref="frameElem"
    :style="{
      'min-width': note.react.width.minCSS,
      width: note.react.width.finalCSS,

      position: note.react.spatial ? 'absolute' : 'relative',
      transform: note.react.spatial
        ? `translate(` +
          `${-note.react.collab.anchor.x * 100}%, ${
            -note.react.collab.anchor.y * 100
          }%)`
        : undefined,

      opacity: note.react.dragging ? '0.7' : undefined,
      'pointer-events': note.react.dragging ? 'none' : undefined,
    }"
  >
    <slot></slot>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import {
  observeResize,
  unobserveResize,
} from 'src/code/pages/static/resize-observer';
import { Vec2 } from 'src/code/pages/static/vec2';
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';

const note = inject<PageNote>('note')!;

const frameElem = ref<Element>();

function resizeListener(entry: ResizeObserverEntry) {
  note.react.worldSize = new Vec2(
    entry.contentRect.width,
    entry.contentRect.height
  );
}

onMounted(() => {
  observeResize(frameElem.value!, resizeListener);
});
onBeforeUnmount(() => {
  unobserveResize(frameElem.value!, resizeListener);
});
</script>
