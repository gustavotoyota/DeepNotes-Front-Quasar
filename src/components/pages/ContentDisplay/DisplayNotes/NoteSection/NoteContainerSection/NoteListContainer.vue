<template>
  <div
    ref="containerElem"
    style="position: absolute; inset: 9px"
  ></div>

  <div
    class="note-container-content"
    :style="{
      width: note.react.width.target,
      'flex-direction': note.collab.container.horizontal ? 'row' : 'column',
      'flex-wrap': note.collab.container.wrapChildren ? 'wrap' : undefined,
    }"
  >
    <!-- Placeholder -->

    <div
      v-if="note.react.notes.length === 0"
      class="note-container-placeholder"
    >
      Drop notes here

      <NoteDropZone
        :parent-note="note"
        :always-visible="true"
        style="top: 0; bottom: 0"
      />
    </div>

    <!-- Children -->

    <template
      v-for="(childNoteId, index) in note.collab.noteIds"
      :key="childNoteId"
    >
      <template
        v-for="childNote in [page.notes.fromId(childNoteId)]"
        :key="childNote?.id ?? childNoteId"
      >
        <div
          v-if="
            childNote != null &&
            (childNote.react.parent === note || note.react.ghost)
          "
          class="note-container-child"
          :style="{
            'flex-direction': note.collab.container.horizontal
              ? 'row'
              : 'column',
            width:
              !note.collab.container.horizontal &&
              note.collab.container.stretchChildren
                ? 'calc(100% - 6px)'
                : undefined,
          }"
        >
          <DisplayNote
            :note="childNote"
            :index="index"
          />

          <div style="position: relative">
            <NoteDropZone
              v-if="index < note.react.notes.length - 1"
              :parent-note="note"
              :index="index + 1"
              style="position: absolute; min-width: 6px; min-height: 6px"
            />
          </div>
        </div>
      </template>
    </template>

    <!-- Last drop zone -->

    <div style="flex: 1; position: relative">
      <NoteDropZone
        :parent-note="note"
        :index="note.collab.noteIds.length"
        style="right: 3px; bottom: 3px"
        :style="{
          left: note.collab.container.horizontal ? '-3px' : '3px',
          top: note.collab.container.horizontal ? '3px' : '-3px',
        }"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, onMounted, ref } from 'vue';

import DisplayNote from '../../DisplayNote.vue';
import NoteDropZone from '../../NoteDropZones/NoteDropZone.vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const containerElem = ref<Element>();

onMounted(() => {
  note.react.container.elem = containerElem.value!;
});
</script>

<style scoped>
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
