<template>
  <div
    ref="originElem"
    style="position: absolute; inset: 9px; pointer-events: none"
  ></div>

  <div
    class="note-container-content"
    :style="{
      width: note.react.width.targetCSS,
      'flex-direction': note.react.collab.container.horizontal
        ? 'row'
        : 'column',
      'flex-wrap': note.react.collab.container.wrapChildren
        ? 'wrap'
        : undefined,
      overflow:
        note.react.container.heightCSS.endsWith('px') ||
        (note.react.collab.container.horizontal && note.react.width.pinned)
          ? 'auto'
          : 'visible',
    }"
  >
    <!-- Background -->

    <div
      v-if="note.react.topLayer.react.validNotes.length === 0"
      class="note-container-background"
    >
      <!-- Placeholder -->

      <div>Drag notes here or</div>
      <div>double-click to create.</div>

      <!-- Initial dropzone -->

      <NoteDropZone
        :parent-note="note"
        :always-visible="true"
        style="top: 0; bottom: 0"
        @dblclick.left="onLeftDoubleClick"
      />
    </div>

    <!-- Children -->

    <template
      v-for="(childNote, index) in note.react.topLayer.react.cleanedNotes"
      :key="childNote?.id ?? index"
    >
      <div
        v-if="childNote != null"
        class="note-container-child"
        :style="{
          'flex-direction': note.react.collab.container.horizontal
            ? 'row'
            : 'column',
          width:
            !note.react.collab.container.horizontal &&
            note.react.collab.container.stretchChildren
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
            v-if="index < note.react.topLayer.react.validNotes.length - 1"
            :parent-note="note"
            :always-visible="true"
            :index="index + 1"
            style="position: absolute; min-width: 6px; min-height: 6px"
            @dblclick.left="onLeftDoubleClick($event, index + 1)"
          />
        </div>
      </div>
    </template>

    <!-- Last drop zone -->

    <div style="flex: 1; position: relative">
      <NoteDropZone
        :parent-note="note"
        :always-visible="true"
        style="right: 3px; bottom: 3px"
        :style="{
          left: note.react.collab.container.horizontal ? '-3px' : '3px',
          top: note.react.collab.container.horizontal ? '3px' : '-3px',
        }"
        @dblclick.left="onLeftDoubleClick"
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

const originElem = ref<Element>();

if (!note.react.rootNote.react.ghost) {
  onMounted(() => {
    note.originElem = originElem.value!;
  });
}

async function onLeftDoubleClick(event: MouseEvent, destIndex?: number) {
  const clientPos = page.pos.eventToClient(event);
  const clientTopLeft = page.rects.fromDOM(
    note.originElem.getBoundingClientRect()
  ).topLeft;
  const worldPos = page.sizes.screenToWorld2D(clientPos.sub(clientTopLeft));

  await page.notes.create(note.react.topLayer, worldPos, false, destIndex);
}
</script>

<style scoped>
.note-container-content {
  flex: 1;

  padding: 4px;

  display: flex;
  align-content: flex-start;

  touch-action: pan-x pan-y !important;
}

.note-container-background {
  position: relative;

  margin: 3px;

  width: calc(100% - 6px);
  height: calc(100% - 6px);

  border-radius: 4px;

  overflow: hidden;

  display: flex;
  flex-direction: column;
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
