<template>
  <div
    :id="`note-${note.id}`"
    class="note-anchor"
    :class="{ absolute: note.react.spatial }"
    :style="{
      position: note.react.spatial ? 'absolute' : 'relative',
      left: note.react.spatial ? `${note.react.collab.pos.x}px` : undefined,
      top: note.react.spatial ? `${note.react.collab.pos.y}px` : undefined,
      width: note.react.spatial ? undefined : '100%',
      'z-index': note.react.spatial ? note.react.collab.zIndex : undefined,
      visibility:
        !note.react.loaded || note.react.resizing ? 'hidden' : undefined,
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
import { inject } from 'vue';

const note = inject<PageNote>('note')!;
</script>

<style scoped>
.absolute {
  position: absolute;

  width: 0;
  height: 0;
}
</style>
