<template>
  <DOMDisplay>
    <template
      v-for="(noteId, index) in layer.react.collab.noteIds"
      :key="noteId"
    >
      <template
        v-for="note in [page.notes.fromId(noteId)]"
        :key="note?.id ?? noteId"
      >
        <DisplayNote
          v-if="note != null"
          :region="page"
          :note="note"
          :index="index"
        />
      </template>
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
