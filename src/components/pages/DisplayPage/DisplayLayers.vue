<template>
  <div
    style="isolation: isolate"
    v-for="layerId of region.react.collab.layerIds"
    :key="layerId"
  >
    <template
      v-for="layer in [page.layers.fromId(layerId)]"
      :key="layer?.id ?? layerId"
    >
      <DisplayLayer
        v-if="layer != null"
        :region="region"
        :layer="layer"
      />
    </template>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/app/pages/page/notes/note';
import { AppPage } from 'src/code/app/pages/page/page';
import { inject } from 'vue';

import DisplayLayer from './DisplayLayer.vue';

defineProps<{
  region: AppPage | PageNote;
}>();

const page = inject<AppPage>('page')!;
</script>
