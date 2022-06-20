<template>
  <div
    :id="`note-${note.id}`"
    class="note-anchor"
    :class="{ absolute: note.react.parentId == null }"
    :style="{
      position: note.react.parentId == null ? 'absolute' : 'relative',
      left: note.react.parentId == null ? `${note.collab.pos.x}px` : undefined,
      top: note.react.parentId == null ? `${note.collab.pos.y}px` : undefined,
      'z-index': note.react.parentId == null ? note.collab.zIndex : undefined,
      visibility:
        note.react.resizing || !note.react.allEditorsLoaded
          ? 'hidden'
          : undefined,
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
