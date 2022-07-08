<template>
  <template
    v-if="
      page.arrowCreation.react.active &&
      page.arrowCreation.fakeArrow.react.region === region
    "
  >
    <SVGDisplay :root="region === page">
      <DisplayArrow :arrow="page.arrowCreation.fakeArrow" />
    </SVGDisplay>

    <DOMDisplay :root="region === page">
      <ArrowLabel :arrow="page.arrowCreation.fakeArrow" />
    </DOMDisplay>
  </template>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

import ArrowLabel from './ArrowLabel.vue';
import DisplayArrow from './DisplayArrow.vue';
import DOMDisplay from './DOMDisplay.vue';
import SVGDisplay from './SVGDisplay.vue';

defineProps<{
  region: AppPage | PageNote;
}>();

const page = inject<AppPage>('page')!;
</script>
