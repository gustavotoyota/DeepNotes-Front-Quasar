<template>
  <div
    ref="containerElem"
    class="note-spatial-container"
    :style="{
      'background-color': note.react.color.shadow,
    }"
    @pointerup.left="onLeftPointerUp"
  >
    <template
      v-for="(noteId, index) in note.collab.noteIds"
      :key="noteId"
    >
      <DisplayNote
        v-if="page.notes.fromId(noteId) != null"
        :note="page.notes.fromId(noteId)!"
        :index="index"
      />
    </template>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, ref } from 'vue';

import DisplayNote from '../../DisplayNote.vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const containerElem = ref<Element>();

async function onLeftPointerUp() {
  if (!page.dragging.react.active) {
    return;
  }

  await page.dropping.perform(note);
}
</script>

<style scoped>
.note-spatial-container {
  flex: 1;

  margin: 9px;

  border-radius: 5px;

  background-color: #808080;

  overflow: hidden;

  position: relative;
}
</style>
