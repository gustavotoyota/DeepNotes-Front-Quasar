<template>
  <line
    v-if="
      arrow.react.sourceNote != null &&
      (arrow.react.targetNote != null || arrow.react.fakeTargetPos != null)
    "
    :id="`arrow-${arrow.id}`"
    class="arrow"
    :style="{
      'pointer-events': arrow.react.fakeTargetPos != null ? 'none' : 'auto',
      stroke: arrow.react.active
        ? arrow.react.color.highlight
        : arrow.react.selected
        ? arrow.react.color.light
        : arrow.collab.color,
    }"
    :x1="arrow.react.sourcePos.x"
    :y1="arrow.react.sourcePos.y"
    :x2="arrow.react.targetPos.x"
    :y2="arrow.react.targetPos.y"
    @pointerdown.left="onLeftPointerDown"
  />

  <polyline
    v-if="arrow.collab.tail"
    :style="{
      'pointer-events': arrow.react.fakeTargetPos != null ? 'none' : 'auto',
      stroke: arrow.react.active
        ? arrow.react.color.highlight
        : arrow.react.selected
        ? arrow.react.color.light
        : arrow.collab.color,
    }"
    :points="`${arrow.react.sourcePos.x + PageArrow.ARROW_SIZE},${
      arrow.react.sourcePos.y - PageArrow.ARROW_SIZE
    } ${arrow.react.sourcePos.x},${arrow.react.sourcePos.y} ${
      arrow.react.sourcePos.x + PageArrow.ARROW_SIZE
    },${arrow.react.sourcePos.y + PageArrow.ARROW_SIZE}`"
    :transform="`rotate(${(arrow.react.angle / Math.PI) * 180},${
      arrow.react.sourcePos.x
    },${arrow.react.sourcePos.y})`"
    class="arrow"
    @pointerdown.left="onLeftPointerDown"
  />

  <polyline
    v-if="arrow.collab.head"
    :style="{
      'pointer-events': arrow.react.fakeTargetPos != null ? 'none' : 'auto',
      stroke: arrow.react.active
        ? arrow.react.color.highlight
        : arrow.react.selected
        ? arrow.react.color.light
        : arrow.collab.color,
    }"
    :points="`${arrow.react.targetPos.x - PageArrow.ARROW_SIZE},${
      arrow.react.targetPos.y - PageArrow.ARROW_SIZE
    } ${arrow.react.targetPos.x},${arrow.react.targetPos.y} ${
      arrow.react.targetPos.x - PageArrow.ARROW_SIZE
    },${arrow.react.targetPos.y + PageArrow.ARROW_SIZE}`"
    :transform="`rotate(${(arrow.react.angle / Math.PI) * 180},${
      arrow.react.targetPos.x
    },${arrow.react.targetPos.y})`"
    class="arrow"
    @pointerdown.left="onLeftPointerDown"
  />
</template>

<script
  setup
  lang="ts"
>
import { PageArrow } from 'src/code/pages/app/page/arrows/arrow';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, watchEffect } from 'vue';

const props = defineProps<{
  arrow: PageArrow;
  index?: number;
}>();

const page = inject<AppPage>('page')!;

function onLeftPointerDown(event: PointerEvent) {
  page.clickSelection.perform(props.arrow, event);
}

watchEffect(() => {
  // eslint-disable-next-line vue/no-mutating-props
  props.arrow.react.index = props.index ?? 0;
});
</script>

<style scoped>
.arrow {
  fill: none;

  stroke-width: 5;
  stroke-linecap: round;
}
</style>
