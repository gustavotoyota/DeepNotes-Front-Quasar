<template>
  <a
    :href="note.react.selected ? undefined : note.collab.link || undefined"
    :target="note.collab.link ? '_blank' : undefined"
    :style="{
      cursor: note.react.cursor,
    }"
  >
    <div
      class="note-content"
      :style="{
        'background-color': note.react.color.background,

        'border-top-color': note.react.color.highlight,
        'border-left-color': note.react.color.highlight,
        'border-bottom-color': note.react.color.shadow,
        'border-right-color': note.react.color.shadow,
      }"
      @touchstart="onTouchStart"
      @pointerdown.left.stop="onPointerDown"
    >
      <slot />
    </div>
  </a>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import {
  hasScrollbar,
  isMouseOverScrollbar,
  isTouchOverScrollbar,
} from 'src/code/pages/static/dom';
import { inject } from 'vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

function onTouchStart(event: TouchEvent) {
  const possiblyScrolling = hasScrollbar(event.target as HTMLElement);

  if (
    getComputedStyle(event.target as Element).touchAction !== 'none' &&
    (!possiblyScrolling ||
      (possiblyScrolling &&
        !isTouchOverScrollbar(event, page.camera.react.zoom)))
  ) {
    event.preventDefault();
  }
}

function onPointerDown(event: PointerEvent) {
  if (isMouseOverScrollbar(event) || note.react.editing) {
    return;
  }

  if (
    (note.collab.link || (event.target as Element).closest('a[href]')) &&
    !event.altKey &&
    !event.shiftKey &&
    !note.react.selected
  ) {
    return;
  }

  page.editing.stop();

  page.clickSelection.perform(note, event);

  if (note.react.selected) {
    page.dragging.start(event);
  }
}
</script>

<style scoped>
.note-content {
  border-radius: 7px;

  border: 1px solid;

  height: 100%;

  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
    0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12) !important;
}
</style>
