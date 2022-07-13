<template>
  <div class="display-layer">
    <!-- Arrows -->

    <SVGDisplay :root="region === page">
      <template
        v-for="(arrowId, index) in layer.react.collab.arrowIds"
        :key="arrowId"
      >
        <template
          v-for="arrow in [page.arrows.fromId(arrowId, layer.id)]"
          :key="arrow?.id ?? arrowId"
        >
          <DisplayArrow
            v-if="arrow != null"
            :arrow="arrow"
            :index="index"
          />
        </template>
      </template>
    </SVGDisplay>

    <!-- Arrow labels -->

    <DOMDisplay :root="region === page">
      <template
        v-for="arrowId in layer.react.collab.arrowIds"
        :key="arrowId"
      >
        <template
          v-for="arrow in [page.arrows.fromId(arrowId, layer.id)]"
          :key="arrow?.id ?? arrowId"
        >
          <ArrowLabel
            v-if="arrow != null"
            :arrow="arrow"
          />
        </template>
      </template>
    </DOMDisplay>

    <!-- Notes -->

    <DOMDisplay :root="region === page">
      <template
        v-for="(noteId, index) in layer.react.collab.noteIds"
        :key="noteId"
      >
        <template
          v-for="note in [page.notes.fromId(noteId, layer.id)]"
          :key="note?.id ?? noteId"
        >
          <DisplayNote
            v-if="note != null"
            :note="note"
            :index="index"
          />
        </template>
      </template>
    </DOMDisplay>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageLayer } from 'src/code/pages/app/page/layers/layer';
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
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
