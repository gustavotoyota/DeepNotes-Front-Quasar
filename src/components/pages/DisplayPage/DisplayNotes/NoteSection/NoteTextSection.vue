<template>
  <NoteSection :section="section">
    <div
      style="flex: 1"
      :style="{ width: note.react.width.targetCSS }"
      @dblclick.left="page.editing.start(note, section)"
    >
      <NoteEditor :section="section" />
    </div>
  </NoteSection>
</template>

<script
  setup
  lang="ts"
>
import { NoteTextSection, PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import NoteEditor from '../NoteEditor.vue';
import NoteSection from './NoteSection.vue';

defineProps<{
  section: NoteTextSection;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;
</script>
