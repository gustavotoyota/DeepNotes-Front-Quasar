<template>
  <q-list v-if="ui.rightSidebarMini">
    <MiniSidebarBtn
      tooltip="Lock position"
      icon="mdi-axis-arrow-lock"
      :active="page.camera.react.lockPos"
      @click="negateProp(page.camera.react, 'lockPos')"
    />

    <MiniSidebarBtn
      tooltip="Lock zoom"
      icon="mdi-arrow-vertical-lock"
      :active="page.camera.react.lockZoom"
      @click="negateProp(page.camera.react, 'lockZoom')"
    />
  </q-list>

  <div v-else>
    <!-- Page name -->

    <div style="padding: 20px">
      <q-input
        label="Page name"
        v-model="page.react.collab.name"
        dense
        filled
        @update:model-value="$pages.realtime.publish({ [`pageName.${page.id}`]:$event as string })"
      />
    </div>

    <q-separator />

    <!-- Lock position and zoom -->

    <div style="padding: 20px; display: flex">
      <q-checkbox
        label="Lock position"
        v-model="page.camera.react.lockPos"
        style="flex: 1; margin-left: -10px; margin-top: -10px"
      />

      <Gap style="width: 16px" />

      <q-checkbox
        label="Lock zoom"
        v-model="page.camera.react.lockZoom"
        style="flex: 1; margin-left: -10px; margin-top: -10px"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { negateProp } from 'src/code/pages/static/utils';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { inject, Ref } from 'vue';

import MiniSidebarBtn from '../misc/MiniSidebarBtn.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;
</script>
