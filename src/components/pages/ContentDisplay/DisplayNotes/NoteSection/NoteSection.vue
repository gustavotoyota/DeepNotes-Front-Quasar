<template>
  <div
    v-if="note.react.collab[section].enabled"
    :style="{
      height: note.react[section].visible ? undefined : '0px',
      overflow: note.react[section].visible ? undefined : 'hidden',
    }"
  >
    <div
      :class="`note-${section}-section`"
      style="display: flex"
      :style="{
        height: note.react[section].height,
        'min-height': section === 'container' ? '52.45px' : '36.45px',
      }"
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
