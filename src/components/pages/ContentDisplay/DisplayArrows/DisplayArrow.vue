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
        ? 'rgb(3, 155, 229)'
        : arrow.react.selected
        ? 'rgb(1, 87, 155)'
        : undefined,
    }"
    :x1="arrow.react.sourcePos.x"
    :y1="arrow.react.sourcePos.y"
    :x2="arrow.react.targetPos.x"
    :y2="arrow.react.targetPos.y"
    @pointerdown.left="onLeftPointerDown"
  />
</template>

<script
  setup
  lang="ts"
>
import { PageArrow } from 'src/code/pages/app/page/arrows/arrow';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

const props = defineProps<{
  arrow: PageArrow;
}>();

const page = inject<AppPage>('page')!;

function onLeftPointerDown(event: PointerEvent) {
  page.clickSelection.perform(props.arrow, event);
}
</script>

<style scoped>
.arrow {
  stroke: #b0b0b0;
  stroke-width: 5;
  stroke-linecap: round;
}
</style>
