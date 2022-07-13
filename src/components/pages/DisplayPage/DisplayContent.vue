<template>
  <div
    v-if="page.react.validNotes.length === 0"
    style="color: #e0e0e0; text-align: center; white-space: nowrap"
  >
    <div>Double-click anywhere</div>
    <div>to create a note.</div>
  </div>

  <DisplayBackground />

  <DisplayLayers :region="page" />

  <!-- Arrow creation -->

  <ArrowCreation :region="page" />

  <!-- Note resizing ghosts -->

  <DOMDisplay
    v-if="page.resizing.react.active"
    :root="true"
  >
    <DisplayNote
      v-for="ghost in page.resizing.react.ghosts"
      :key="(ghost as PageNote).id"
      :note="(ghost as PageNote)"
      style="opacity: 0.7"
    />
  </DOMDisplay>

  <!-- Box selection -->

  <DisplayBoxSelection :region="page" />
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import ArrowCreation from './ArrowCreation.vue';
import DisplayBackground from './DisplayBackground.vue';
import DisplayBoxSelection from './DisplayBoxSelection.vue';
import DisplayLayers from './DisplayLayers.vue';
import DisplayNote from './DisplayNote/DisplayNote.vue';
import DOMDisplay from './DOMDisplay.vue';

const page = inject<AppPage>('page')!;
</script>
