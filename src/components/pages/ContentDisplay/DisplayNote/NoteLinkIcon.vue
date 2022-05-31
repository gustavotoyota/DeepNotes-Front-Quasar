<template>
  <q-icon
    v-if="note.collab.link"
    :name="note.react.link.external ? 'mdi-launch' : 'mdi-link-variant'"
    :size="note.react.link.external ? '15px' : '16px'"
    style="
      position: absolute;
      left: 50%;
      top: 1px;
      transform: translate(-50%, -50%);
      pointer-events: none;
    "
  />
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { inject } from 'vue';

const note = inject<PageNote>('note')!;
</script>
