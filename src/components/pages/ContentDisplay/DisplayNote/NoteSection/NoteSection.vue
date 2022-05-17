<template>
  <div
    v-if="note.collab[section].enabled"
    :style="{
      height: note.react[section].visible ? undefined : '0px',
      overflow: note.react[section].visible ? undefined : 'hidden',
    }"
  >
    <div
      :class="`note-${section}-section`"
      style="display: flex; min-height: 36.45px"
      :style="{ height: note.react[section].height }"
    >
      <slot></slot>

      <NoteCollapseBtn :section="section" />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { NoteSection, PageNote } from 'src/code/pages/app/page/notes/note';
import { inject } from 'vue';

import NoteCollapseBtn from '../NoteCollapseBtn.vue';

defineProps<{
  section: NoteSection;
}>();

const note = inject<PageNote>('note')!;
</script>
