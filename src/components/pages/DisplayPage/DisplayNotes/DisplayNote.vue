<template>
  <NoteAnchor v-show="note.react.index === index || note.react.ghost">
    <NoteDropZones />

    <NoteFrame>
      <NoteArrowHandles />

      <NoteResizeHandles />

      <NoteLinkIcon />

      <NoteContent>
        <NoteTextSection section="head" />

        <NoteDivider section="head" />

        <NoteTextSection section="body" />

        <NoteDivider section="body" />

        <NoteContainerSection />
      </NoteContent>
    </NoteFrame>
  </NoteAnchor>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { onUnmounted, provide, watchEffect } from 'vue';

import NoteAnchor from './NoteAnchor.vue';
import NoteArrowHandles from './NoteArrowHandles/NoteArrowHandles.vue';
import NoteContent from './NoteContent.vue';
import NoteDivider from './NoteDivider.vue';
import NoteDropZones from './NoteDropZones/NoteDropZones.vue';
import NoteFrame from './NoteFrame.vue';
import NoteLinkIcon from './NoteLinkIcon.vue';
import NoteResizeHandles from './NoteResizeHandles/NoteResizeHandles.vue';
import NoteContainerSection from './NoteSection/NoteContainerSection/NoteContainerSection.vue';
import NoteTextSection from './NoteSection/NoteTextSection.vue';

const props = defineProps<{
  note: PageNote;
  index?: number;
}>();

provide('note', props.note);

const unwatch = watchEffect(() => {
  // eslint-disable-next-line vue/no-mutating-props
  props.note.react.index = props.index ?? 0;
});

onUnmounted(() => {
  unwatch();
});
</script>
