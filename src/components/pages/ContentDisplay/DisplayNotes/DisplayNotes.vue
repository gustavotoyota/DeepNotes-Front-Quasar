<template>
  <DOMDisplay>
    <template
      v-for="(noteId, index) in layer.collab.noteIds"
      :key="noteId"
    >
      <DisplayNote
        v-if="page.notes.fromId(noteId) != null"
        :note="page.notes.fromId(noteId)!"
        :index="index"
      />
    </template>
  </DOMDisplay>
</template>

<script
  setup
  lang="ts"
>
import { PageLayer } from 'src/code/pages/app/page/layers/layer';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import DOMDisplay from '../DOMDisplay.vue';
import DisplayNote from './DisplayNote.vue';

const page = inject<AppPage>('page')!;
const layer = inject<PageLayer>('layer')!;
</script>
