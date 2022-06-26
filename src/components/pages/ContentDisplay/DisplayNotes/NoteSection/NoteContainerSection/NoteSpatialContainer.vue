<template>
  <div
    ref="containerElem"
    class="note-spatial-container"
    :style="{
      'background-color': note.react.color.shadow,
    }"
    @pointerover.stop="onPointerOver"
    @pointerout.stop="onPointerOut"
    @pointerup.left="onLeftPointerUp"
  >
    <!-- Background -->

    <div
      class="note-spatial-background"
      @dblclick.left="onLeftDoubleClick"
    >
      <!-- Placeholder -->

      <template v-if="note.react.notes.length === 0">
        <div>Drag notes here or</div>
        <div>double-click to create.</div>
      </template>
    </div>

    <!-- Arrows -->

    <svg
      style="position: absolute; pointer-events: none"
      left="0"
      top="0"
      width="100%"
      height="100%"
    >
      <template
        v-for="(arrowId, index) in note.collab.arrowIds"
        :key="arrowId"
      >
        <template
          v-for="arrow in [page.arrows.fromId(arrowId)]"
          :key="arrow?.id ?? arrowId"
        >
          <DisplayArrow
            v-if="arrow != null"
            :arrow="arrow"
            :index="index"
          />
        </template>
      </template>
    </svg>

    <!-- Notes -->

    <template
      v-for="(childNoteId, index) in note.collab.noteIds"
      :key="childNoteId"
    >
      <template
        v-for="childNote in [page.notes.fromId(childNoteId)]"
        :key="childNote?.id ?? childNoteId"
      >
        <DisplayNote
          v-if="
            childNote != null &&
            (childNote.react.parent === note || note.react.ghost)
          "
          :note="childNote"
          :index="index"
      /></template>
    </template>

    <!-- Arrow creation -->

    <svg
      v-if="
        page.arrowCreation.react.active &&
        page.arrowCreation.fakeArrow.react.parent == note
      "
      style="position: absolute; pointer-events: none"
      left="0"
      top="0"
      width="100%"
      height="100%"
    >
      <DisplayArrow :arrow="page.arrowCreation.fakeArrow" />
    </svg>

    <!-- Drop zone -->

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
import { Vec2 } from 'src/code/pages/static/vec2';
import { inject, onMounted, ref } from 'vue';

import DisplayArrow from '../../../DisplayArrows/DisplayArrow.vue';
import DisplayNote from '../../DisplayNote.vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const containerElem = ref<Element>();

onMounted(() => {
  note.react.container.elem = containerElem.value!;
});

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

async function onLeftDoubleClick(event: MouseEvent) {
  await page.notes.create(note, new Vec2(event.offsetX, event.offsetY));
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

  z-index: 2147483646;
}

.note-spatial-background {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: #e0e0e0;
  font-size: 13px;
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
