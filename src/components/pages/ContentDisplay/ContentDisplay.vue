<template>
  <div
    class="display"
    @wheel="onWheel"
    @pointerdown.middle.prevent="onMiddlePointerDown"
  >
    <template v-if="page.react.loaded && page.react.hasPermission">
      <DisplayBackground />
      <DisplayNotes />
      <DisplayBoxSelection />
      <DisplayBtns />
    </template>

    <LoadingOverlay v-if="!page.react.loaded" />

    <div
      v-if="!page.react.hasPermission"
      style="
        position: absolute;

        left: 0;
        top: 0;
        right: 0;
        bottom: 0;

        background-color: #181818;

        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div style="text-align: center">
        <div>You don't have permission to access this page.</div>

        <Gap style="height: 12px" />

        <q-btn
          :label="
            page.react.roleId == null ? 'Request access' : 'Access requested'
          "
          :disable="page.react.roleId != null"
          color="primary"
          @click="page.requestAccess()"
        />
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { provide } from 'vue';

import DisplayBackground from './DisplayBackground.vue';
import DisplayBoxSelection from './DisplayBoxSelection.vue';
import DisplayBtns from './DisplayBtns.vue';
import DisplayNotes from './DisplayNotes.vue';

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);

function onWheel(event: WheelEvent) {
  props.page.zooming.perform(event);
}

function onMiddlePointerDown(event: PointerEvent) {
  props.page.panning.start(event);
}
</script>

<style scoped>
.display {
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  overflow: hidden;
}

.display :deep(a[target='_blank']) {
  text-decoration: none !important;

  color: #64b5f6;
}
</style>
