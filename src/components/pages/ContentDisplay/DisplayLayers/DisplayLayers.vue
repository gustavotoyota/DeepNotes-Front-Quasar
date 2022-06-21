<template>
  <template
    v-for="(layerId, index) of page.react.collab.layerIds"
    :key="layerId"
  >
    <DisplayLayer
      v-if="page.layers.fromId(layerId) != null"
      :layer="page.layers.fromId(layerId)!"
      :style="{
        'z-index': index,
      }"
    />
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
