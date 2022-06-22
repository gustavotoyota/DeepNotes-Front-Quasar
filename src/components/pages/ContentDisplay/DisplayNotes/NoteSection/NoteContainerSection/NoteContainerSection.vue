<template>
  <NoteSection
    ref="containerElem"
    section="container"
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
import { inject, onMounted, ref } from 'vue';

import NoteSection from '../NoteSection.vue';
import NoteListContainer from './NoteListContainer.vue';
import NoteSpatialContainer from './NoteSpatialContainer.vue';

const note = inject<PageNote>('note')!;

const containerElem = ref<any>();

onMounted(() => {
  note.react.container.elem = containerElem.value.$el;
});
</script>

<style scoped>
.note-container-section {
  display: flex;

  min-height: 52.45px;
}

.note-container-content {
  flex: 1;

  padding: 4px;

  display: flex;
  align-content: flex-start;

  overflow: auto;

  touch-action: pan-x pan-y !important;
}

.note-container-placeholder {
  position: relative;

  margin: 3px;

  width: calc(100% - 6px);
  height: calc(100% - 6px);

  border-radius: 4px;

  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #e0e0e0;
  font-size: 13px;
}

.note-container-drop-zone {
  background-color: #42a5f5;

  opacity: 0;
}
.note-container-drop-zone.active {
  opacity: 0.25;
}

.note-container-child {
  flex: none;

  display: flex;

  margin: 3px;
}
</style>
