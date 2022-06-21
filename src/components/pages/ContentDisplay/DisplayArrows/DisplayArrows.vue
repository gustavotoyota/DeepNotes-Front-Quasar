<template>
  <SVGDisplay>
    <template
      v-for="(arrowId, index) in layer.collab.arrowIds"
      :key="arrowId"
    >
      <DisplayArrow
        v-if="page.arrows.fromId(arrowId) != null"
        :arrow="page.arrows.fromId(arrowId)!"
        :index="index"
      />
    </template>
  </SVGDisplay>
</template>

<script
  setup
  lang="ts"
>
import { PageLayer } from 'src/code/pages/app/page/layers/layer';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import SVGDisplay from '../SVGDisplay.vue';
import DisplayArrow from './DisplayArrow.vue';

const page = inject<AppPage>('page')!;
const layer = inject<PageLayer>('layer')!;
</script>
