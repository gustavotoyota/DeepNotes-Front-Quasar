<template>
  <div
    v-if="note.react.region instanceof PageNote && page.dragging.react.active"
  >
    <NoteDropZone
      :parent-note="note.react.region"
      :index="note.react.index"
      :style="{
        top: note.react.region.react.collab.container.horizontal ? '0' : '0%',
        bottom: note.react.region.react.collab.container.horizontal
          ? '0'
          : '50%',
        left: note.react.region.react.collab.container.horizontal ? '0%' : '0',
        right: note.react.region.react.collab.container.horizontal
          ? '50%'
          : '0',
      }"
    />

    <NoteDropZone
      :parent-note="note.react.region"
      :index="note.react.index + 1"
      :style="{
        top: note.react.region.react.collab.container.horizontal ? '0' : '50%',
        bottom: note.react.region.react.collab.container.horizontal
          ? '0'
          : '0%',
        left: note.react.region.react.collab.container.horizontal ? '50%' : '0',
        right: note.react.region.react.collab.container.horizontal ? '0%' : '0',
      }"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/app/pages/page/notes/note';
import { AppPage } from 'src/code/app/pages/page/page';
import { inject } from 'vue';

import NoteDropZone from './NoteDropZone.vue';

const note = inject<PageNote>('note')!;
const page = inject<AppPage>('page')!;
</script>
