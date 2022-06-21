<template>
  <div
    :id="`note-${note.id}`"
    class="note-anchor"
    :class="{ absolute: note.react.parent == null }"
    :style="{
      position: note.react.parent == null ? 'absolute' : 'relative',
      left: note.react.parent == null ? `${note.collab.pos.x}px` : undefined,
      top: note.react.parent == null ? `${note.collab.pos.y}px` : undefined,
      'z-index': note.react.parent == null ? note.collab.zIndex : undefined,
      visibility:
        note.react.resizing || !note.react.loaded ? 'hidden' : undefined,
    }"
  >
    <slot />
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
.note-anchor {
  width: 100%;
}

.absolute {
  position: absolute;

  width: 0;
  height: 0;
}
</style>
