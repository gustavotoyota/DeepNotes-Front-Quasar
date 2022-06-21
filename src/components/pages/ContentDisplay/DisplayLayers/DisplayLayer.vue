<template>
  <div class="display-layer">
    <DisplayArrows />
    <DisplayNotes />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageLayer } from 'src/code/pages/app/page/layers/layer';
import { provide } from 'vue';

import DisplayArrows from '../DisplayArrows/DisplayArrows.vue';
import DisplayNotes from '../DisplayNotes/DisplayNotes.vue';

const props = defineProps<{
  layer: PageLayer;
}>();

provide('layer', props.layer);
</script>

<style scoped>
.display-layer {
  position: absolute;

  inset: 0;

  pointer-events: none;
}
</style>
