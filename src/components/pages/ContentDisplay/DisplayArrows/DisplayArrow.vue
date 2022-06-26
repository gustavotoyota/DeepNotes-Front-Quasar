<template>
  <template v-if="arrow.react.valid">
    <line
      :id="`arrow-${arrow.id}`"
      :style="{
        'pointer-events': arrow.react.fakeTargetPos != null ? 'none' : 'auto',
      }"
      stroke="black"
      stroke-width="16"
      stroke-opacity="0"
      stroke-linecap="round"
      :x1="arrow.react.sourcePos.x"
      :y1="arrow.react.sourcePos.y"
      :x2="arrow.react.targetPos.x"
      :y2="arrow.react.targetPos.y"
      @pointerdown.left.stop="onLeftPointerDown"
    />

    <line
      class="arrow"
      :id="`arrow-${arrow.id}`"
      :stroke="arrow.react.color.final"
      :x1="arrow.react.sourcePos.x"
      :y1="arrow.react.sourcePos.y"
      :x2="arrow.react.targetPos.x"
      :y2="arrow.react.targetPos.y"
      :stroke-dasharray="arrow.react.collab.dashed ? '6,6' : undefined"
    />

    <polyline
      v-if="arrow.react.collab.backward"
      :stroke="arrow.react.color.final"
      :points="`${arrow.react.sourcePos.x + PageArrow.ARROW_SIZE},${
        arrow.react.sourcePos.y - PageArrow.ARROW_SIZE
      } ${arrow.react.sourcePos.x},${arrow.react.sourcePos.y} ${
        arrow.react.sourcePos.x + PageArrow.ARROW_SIZE
      },${arrow.react.sourcePos.y + PageArrow.ARROW_SIZE}`"
      :transform="`rotate(${(arrow.react.angle / Math.PI) * 180},${
        arrow.react.sourcePos.x
      },${arrow.react.sourcePos.y})`"
      class="arrow"
    />

    <polyline
      v-if="arrow.react.collab.forward"
      :stroke="arrow.react.color.final"
      :points="`${arrow.react.targetPos.x - PageArrow.ARROW_SIZE},${
        arrow.react.targetPos.y - PageArrow.ARROW_SIZE
      } ${arrow.react.targetPos.x},${arrow.react.targetPos.y} ${
        arrow.react.targetPos.x - PageArrow.ARROW_SIZE
      },${arrow.react.targetPos.y + PageArrow.ARROW_SIZE}`"
      :transform="`rotate(${(arrow.react.angle / Math.PI) * 180},${
        arrow.react.targetPos.x
      },${arrow.react.targetPos.y})`"
      class="arrow"
    />
  </template>
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
}
</style>
