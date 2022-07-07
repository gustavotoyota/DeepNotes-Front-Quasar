<template>
  <template v-if="root">
    <!-- Centralizer -->

    <div class="display-centralizer">
      <!-- Viewbox -->

      <div
        class="display-viewbox"
        :style="{
          transform:
            `scale(${page.camera.react.zoom}) ` +
            `translate(${-page.camera.react.pos.x}px, ${-page.camera.react.pos
              .y}px)`,
        }"
      >
        <slot></slot>
      </div>
    </div>
  </template>

  <div
    v-else
    style="
      pointer-events: auto;
      width: 0;
      height: 0;

      isolation: isolate;
    "
  >
    <slot></slot>
  </div>
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

<style scoped>
.display-centralizer {
  position: absolute;

  left: 50%;
  top: 50%;
}

.display-viewbox {
  position: relative;

  width: 0;
  height: 0;

  pointer-events: auto;

  isolation: isolate;
}
</style>
