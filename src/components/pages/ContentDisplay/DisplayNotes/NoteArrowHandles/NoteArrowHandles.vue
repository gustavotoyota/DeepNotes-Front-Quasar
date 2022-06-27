<template>
  <div
    v-if="
      !page.react.readonly &&
      note.react.spatial &&
      note.react.active &&
      !note.react.dragging
    "
    class="note-arrow-handles"
  >
    <NoteArrowHandle
      :note="note"
      style="
        top: 50%;
        left: -24px;
        transform: translate(-50%, -50%) rotateZ(-90deg);
      "
    />

    <NoteArrowHandle
      :note="note"
      style="
        top: 50%;
        right: -24px;
        transform: translate(50%, -50%) rotateZ(90deg);
      "
    />

    <NoteArrowHandle
      :note="note"
      style="
        top: -24px;
        left: 50%;
        transform: translate(-50%, -50%) rotateZ(0deg);
      "
    />

    <NoteArrowHandle
      :note="note"
      style="
        bottom: -24px;
        left: 50%;
        transform: translate(-50%, 50%) rotateZ(180deg);
      "
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import NoteArrowHandle from './NoteArrowHandle.vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;
</script>
