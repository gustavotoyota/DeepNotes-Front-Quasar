<template>
  <NoteSection
    section="container"
    style="position: relative"
  >
    <NoteSpatialContainer v-if="note.collab.container.spatial" />
    <NoteListContainer v-else />
  </NoteSection>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { inject } from 'vue';

import NoteSection from '../NoteSection.vue';
import NoteListContainer from './NoteListContainer.vue';
import NoteSpatialContainer from './NoteSpatialContainer.vue';

const note = inject<PageNote>('note')!;
</script>

<style scoped>
.note-container-section {
  display: flex;

  min-height: 52.45px;
}
</style>
