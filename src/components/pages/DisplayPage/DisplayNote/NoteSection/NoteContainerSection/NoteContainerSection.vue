<template>
  <NoteSection
    section="container"
    style="position: relative"
  >
    <NoteSpatialContainer v-if="note.react.collab.container.spatial" />
    <NoteListContainer v-else />
  </NoteSection>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/app/pages/page/notes/note';
import { inject } from 'vue';

import NoteSection from '../NoteSection.vue';
import NoteListContainer from './NoteListContainer.vue';
import NoteSpatialContainer from './NoteSpatialContainer.vue';

const note = inject<PageNote>('note')!;
</script>
