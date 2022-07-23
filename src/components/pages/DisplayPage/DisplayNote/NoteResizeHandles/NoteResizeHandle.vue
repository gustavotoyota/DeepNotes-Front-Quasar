<template>
  <div
    v-if="
      !note.page.react.readonly &&
      note.react.collab.resizable &&
      note.react.selected &&
      !note.react.ghost
    "
    class="note-handle"
    :style="{
      left: left,
      top: top,
      cursor: `${side}-resize`,
      'pointer-events': page.dragging.react.active ? 'none' : 'auto',
      opacity: page.dragging.react.active ? '0.7' : undefined,
    }"
    @pointerdown.left.stop="onLeftPointerDown"
    @dblclick.left="onLeftDoubleClick"
  />
</template>

<script
  setup
  lang="ts"
>
import {
  NoteSection,
  NoteSide,
  PageNote,
} from 'src/code/app/pages/page/notes/note';
import { AppPage } from 'src/code/app/pages/page/page';
import { Vec2 } from 'src/code/lib/vec2';
import { computed, nextTick } from 'vue';
import { inject } from 'vue';

const props = defineProps<{
  side: NoteSide;
  section?: NoteSection;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const left = computed(() => {
  if (props.side.includes('w')) {
    return '0%';
  } else if (props.side.includes('e')) {
    return '100%';
  } else {
    return '50%';
  }
});
const top = computed(() => {
  if (props.side.includes('n')) {
    return '0%';
  } else if (props.side.includes('s')) {
    return '100%';
  } else {
    return '50%';
  }
});

async function onLeftPointerDown(event: PointerEvent) {
  await page.resizing.start(event, note, props.side, props.section);
}

async function onLeftDoubleClick() {
  const oldFrameRect = note.getWorldRect('note-frame');

  if (props.side.includes('n') || props.side.includes('s')) {
    note.react.collab[props.section!].height[note.react.sizeProp] = 'Auto';
  } else if (props.side.includes('w') || props.side.includes('e')) {
    note.react.collab.width[note.react.sizeProp] = 'Auto';
  }

  await nextTick();

  const newFrameRect = note.getWorldRect('note-frame');

  if (props.side.includes('n')) {
    const delta = oldFrameRect.bottomRight.y - newFrameRect.bottomRight.y;

    newFrameRect.topLeft.y += delta;
    newFrameRect.bottomRight.y += delta;
  } else if (props.side.includes('s')) {
    const delta = oldFrameRect.topLeft.y - newFrameRect.topLeft.y;

    newFrameRect.topLeft.y += delta;
    newFrameRect.bottomRight.y += delta;
  } else if (props.side.includes('w')) {
    const delta = oldFrameRect.bottomRight.x - newFrameRect.bottomRight.x;

    newFrameRect.topLeft.x += delta;
    newFrameRect.bottomRight.x += delta;
  } else if (props.side.includes('e')) {
    const delta = oldFrameRect.topLeft.x - newFrameRect.topLeft.x;

    newFrameRect.topLeft.x += delta;
    newFrameRect.bottomRight.x += delta;
  }

  note.react.collab.pos = newFrameRect.topLeft.add(
    newFrameRect.bottomRight
      .sub(newFrameRect.topLeft)
      .mul(new Vec2(note.react.collab.anchor))
  );
}
</script>

<style scoped>
.note-handle {
  position: absolute;

  border-radius: 999px;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);

  background-color: #2196f3;
  pointer-events: auto;
  z-index: 2147483647;
}
</style>
