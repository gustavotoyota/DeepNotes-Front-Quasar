<template>
  <div
    class="note-spatial-container"
    :style="{
      'background-color': note.react.color.shadow,
    }"
    @pointerover.stop="onPointerOver"
    @pointerout.stop="onPointerOut"
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

    <div
      v-if="
        page.dragging.react.active &&
        page.dragging.react.dropRegionId == null &&
        pointerOver
      "
      class="note-spatial-drop-zone"
    ></div>
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

const pointerOver = ref(false);

function onPointerOver() {
  pointerOver.value = true;
}
function onPointerOut() {
  pointerOver.value = false;
}

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

.note-spatial-drop-zone {
  position: absolute;

  inset: 0;

  background-color: #42a5f5;
  opacity: 0.25;

  pointer-events: none;

  z-index: 2147483647;
}
</style>
