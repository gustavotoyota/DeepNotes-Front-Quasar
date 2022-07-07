<template>
  <div
    v-if="alwaysVisible || page.dragging.react.active"
    class="note-drop-zone"
    :class="{
      active:
        page.dragging.react.active &&
        page.dragging.react.dropRegionId == parentNote.id &&
        page.dragging.react.dropIndex === targetIndex,
    }"
    @pointerover="onPointerOver"
    @pointerout="onPointerOut"
    @pointerup.left="onLeftPointerUp"
  ></div>
</template>

<script
  setup
  lang="ts"
>
import { computed } from '@vue/reactivity';
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

const props = defineProps<{
  parentNote: PageNote;
  index?: number;
  alwaysVisible?: boolean;
}>();

const targetIndex = computed(
  () =>
    props.index ??
    props.parentNote.react.activeLayer.react.collab.noteIds.length
);

const page = inject<AppPage>('page')!;

function onPointerOver() {
  if (!page.dragging.react.active) {
    return;
  }

  page.dragging.react.dropRegionId = props.parentNote.id;
  page.dragging.react.dropIndex = targetIndex.value;
}

function onPointerOut() {
  if (!page.dragging.react.active) {
    return;
  }

  page.dragging.react.dropRegionId = null;
  page.dragging.react.dropIndex = null;
}

async function onLeftPointerUp() {
  if (!page.dragging.react.active) {
    return;
  }

  await page.dropping.perform(props.parentNote, targetIndex.value);
}
</script>

<style scoped>
.note-drop-zone {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  background-color: #42a5f5;
  opacity: 0;

  z-index: 2147483646;
}
.note-drop-zone.active {
  opacity: 0.25;
}
</style>
