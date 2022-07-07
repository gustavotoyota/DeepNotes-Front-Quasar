<template>
  <svg
    style="position: absolute; pointer-events: none"
    left="0"
    top="0"
    width="100%"
    height="100%"
  >
    <svg
      v-if="root"
      x="50%"
      y="50%"
      style="overflow: visible"
    >
      <g
        :transform="
          'scale(' +
          page.camera.react.zoom +
          ') ' +
          'translate(' +
          -page.camera.react.pos.x +
          ', ' +
          -page.camera.react.pos.y +
          ')'
        "
      >
        <slot></slot>
      </g>
    </svg>

    <slot v-else></slot>
  </svg>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

defineProps<{
  root: boolean;
}>();

const page = inject<AppPage>('page')!;
</script>
