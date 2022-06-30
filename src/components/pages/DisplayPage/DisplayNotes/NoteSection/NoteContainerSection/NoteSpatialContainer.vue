<template>
  <div
    ref="originElem"
    class="note-spatial-container"
    :style="{
      'background-color': note.react.color.shadow,
    }"
    @pointerover.stop="onPointerOver"
    @pointerout.stop="onPointerOut"
    @pointerdown.left.stop="onLeftPointerDown"
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

    <!-- Layers -->

    <template
      v-for="layerId in note.react.collab.layerIds"
      :key="layerId"
    >
      <template
        v-for="layer in [page.layers.fromId(layerId)]"
        :key="layer?.id ?? layerId"
      >
        <template v-if="layer != null">
          <!-- Arrows -->

          <svg
            style="position: absolute; pointer-events: none"
            left="0"
            top="0"
            width="100%"
            height="100%"
          >
            <template
              v-for="(arrowId, index) in layer.react.collab.arrowIds"
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
            v-for="(childNoteId, index) in layer.react.collab.noteIds"
            :key="childNoteId"
          >
            <template
              v-for="childNote in [page.notes.fromId(childNoteId)]"
              :key="childNote?.id ?? childNoteId"
            >
              <DisplayNote
                v-if="
                  childNote != null &&
                  (childNote.react.region === note || note.react.ghost)
                "
                :note="childNote"
                :index="index"
            /></template>
          </template>
        </template>
      </template>
    </template>

    <!-- Arrow creation -->

    <svg
      v-if="
        page.arrowCreation.react.active &&
        page.arrowCreation.fakeArrow.react.region === note
      "
      style="position: absolute; pointer-events: none"
      left="0"
      top="0"
      width="100%"
      height="100%"
    >
      <DisplayArrow :arrow="page.arrowCreation.fakeArrow" />
    </svg>

    <!-- Box selection -->

    <DisplayBoxSelection :region="note" />

    <!-- Fake drop zone -->

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
import DisplayBoxSelection from '../../../DisplayBoxSelection.vue';
import DisplayNote from '../../DisplayNote.vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const originElem = ref<Element>();

onMounted(() => {
  note.originElem = originElem.value!;
});

const pointerOver = ref(false);

function onPointerOver() {
  pointerOver.value = true;
}
function onPointerOut() {
  pointerOver.value = false;
}

function onLeftPointerDown(event: PointerEvent) {
  page.editing.stop();

  if (!event.ctrlKey && !event.shiftKey) {
    page.selection.clear(note);
  }

  page.boxSelection.start(event, note);
}
async function onLeftPointerUp() {
  if (!page.dragging.react.active) {
    return;
  }

  await page.dropping.perform(note);
}

async function onLeftDoubleClick(event: MouseEvent) {
  await page.notes.create(
    note.react.activeLayer,
    new Vec2(event.offsetX, event.offsetY)
  );
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
