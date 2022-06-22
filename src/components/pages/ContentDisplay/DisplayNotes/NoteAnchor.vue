<template>
  <div
    :id="`note-${note.id}`"
    class="note-anchor"
    :class="{ absolute: spatial }"
    :style="{
      position: spatial ? 'absolute' : 'relative',
      left: spatial ? `${note.collab.pos.x}px` : undefined,
      top: spatial ? `${note.collab.pos.y}px` : undefined,
      width: spatial ? undefined : '100%',
      'z-index': spatial ? note.collab.zIndex : undefined,
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
import { computed } from '@vue/reactivity';
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { inject } from 'vue';

const note = inject<PageNote>('note')!;

const spatial = computed(
  () => note.react.parent == null || note.react.parent.collab.container.spatial
);
</script>

<style scoped>
.absolute {
  position: absolute;

  width: 0;
  height: 0;
}
</style>
