<template>
  <template
    v-for="(layerId, index) of page.react.collab.layerIds"
    :key="layerId"
  >
    <template
      v-for="layer in [page.layers.fromId(layerId)]"
      :key="layer?.id ?? layerId"
    >
      <DisplayLayer
        v-if="layer != null"
        :layer="layer"
        :style="{
          'z-index': index,
        }"
    /></template>
  </template>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import DisplayLayer from './DisplayLayer.vue';

const page = inject<AppPage>('page')!;
</script>
