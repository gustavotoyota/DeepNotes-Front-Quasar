<template>
  <svg
    style="position: absolute; pointer-events: none"
    left="0"
    top="0"
    width="100%"
    height="100%"
  >
    <svg
      x="50%"
      y="50%"
      style="overflow: visible"
    >
      <g
        :transform="
          'scale(' +
          page.camera.react.zoom +
          ') ' +
          'translate(' +
          -page.camera.react.pos.x +
          ', ' +
          -page.camera.react.pos.y +
          ')'
        "
      >
        <template
          v-for="(arrowId, index) in page.react.collab.arrowIds"
          :key="arrowId"
        >
          <DisplayArrow
            v-if="page.arrows.fromId(arrowId) != null"
            :arrow="page.arrows.fromId(arrowId)!"
            :index="index"
          />
        </template>

        <DisplayArrow
          v-if="page.arrowCreation.react.active"
          :arrow="page.arrowCreation.fakeArrow"
        />
      </g>
    </svg>
  </svg>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import DisplayArrow from './DisplayArrow.vue';

const page = inject<AppPage>('page')!;
</script>
