<template>
  <div
    v-if="
      !note.react.collapsing.collapsed &&
      note.react[section].visible &&
      note.react.bottomSection !== section
    "
    style="position: relative"
  >
    <q-separator style="background: rgba(255, 255, 255, 0.35)" />

    <NoteResizeHandle
      side="s"
      :section="section"
      style="margin-top: -0.5px"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { NoteSection, PageNote } from 'src/code/pages/app/page/notes/note';
import { inject } from 'vue';

import NoteResizeHandle from './NoteResizeHandles/NoteResizeHandle.vue';

defineProps<{
  section: NoteSection;
}>();

const note = inject<PageNote>('note')!;
</script>
