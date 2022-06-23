<template>
  <SVGDisplay>
    <template
      v-for="(arrowId, index) in layer.collab.arrowIds"
      :key="arrowId"
    >
      <template
        v-for="arrow in [page.arrows.fromId(arrowId)]"
        :key="arrow?.id ?? arrowId"
      >
        <DisplayArrow
          v-if="arrow != null"
          :arrow="arrow"
          :index="index"
        />
      </template>
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
