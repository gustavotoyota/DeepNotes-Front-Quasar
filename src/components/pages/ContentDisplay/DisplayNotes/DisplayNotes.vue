<template>
  <!-- Centralizer -->
  <div
    class="display-centralizer"
    style="position: absolute; left: 50%; top: 50%"
  >
    <!-- Viewbox -->
    <div
      class="display-viewbox"
      style="width: 0; height: 0; position: relative"
      :style="{
        transform:
          `scale(${page.camera.react.zoom}) ` +
          `translate(${-page.camera.react.pos.x}px, ${-page.camera.react.pos
            .y}px)`,
      }"
    >
      <template
        v-for="(noteId, index) in page.react.noteIds"
        :key="noteId"
      >
        <DisplayNote
          v-if="page.notes.fromId(noteId) != null"
          :note="page.notes.fromId(noteId)!"
          :index="index"
        />
      </template>

      <template v-if="page.resizing.react.active">
        <DisplayNote
          v-for="ghost in page.resizing.react.ghosts"
          :key="ghost.id"
          :note="ghost"
          style="opacity: 0.7"
        />
      </template>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import DisplayNote from './DisplayNote.vue';

const page = inject<AppPage>('page')!;
</script>
