<template>
  <div class="display-layer">
    <!-- Arrows -->

    <SVGDisplay :root="region === page">
      <template
        v-for="(arrow, index) in layer.react.cleanedArrows"
        :key="arrow?.id ?? index"
      >
        <DisplayArrow
          v-if="arrow != null"
          :arrow="arrow"
          :index="index"
        />
      </template>
    </SVGDisplay>

    <!-- Arrow labels -->

    <DOMDisplay :root="region === page">
      <template
        v-for="(arrow, index) in layer.react.cleanedArrows"
        :key="arrow?.id ?? index"
      >
        <ArrowLabel
          v-if="arrow != null"
          :arrow="arrow"
        />
      </template>
    </DOMDisplay>

    <!-- Notes -->

    <DOMDisplay :root="region === page">
      <template
        v-for="(note, index) in layer.react.cleanedNotes"
        :key="note?.id ?? index"
      >
        <DisplayNote
          v-if="note != null"
          :note="note"
          :index="index"
        />
      </template>
    </DOMDisplay>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageLayer } from 'src/code/app/pages/page/layers/layer';
import { PageNote } from 'src/code/app/pages/page/notes/note';
import { AppPage } from 'src/code/app/pages/page/page';
import { inject, provide } from 'vue';

import ArrowLabel from './ArrowLabel.vue';
import DisplayArrow from './DisplayArrow.vue';
import DisplayNote from './DisplayNote/DisplayNote.vue';
import DOMDisplay from './DOMDisplay.vue';
import SVGDisplay from './SVGDisplay.vue';

const props = defineProps<{
  region: AppPage | PageNote;
  layer: PageLayer;
}>();

provide('layer', props.layer);

const page = inject<AppPage>('page')!;
</script>

<style scoped>
.display-layer {
  position: absolute;

  inset: 0;

  pointer-events: none;

  isolation: isolate;
}
</style>
