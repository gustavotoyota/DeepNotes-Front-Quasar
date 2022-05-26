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
        dense
        filled
        :model-value="pageName"
        @update:model-value="pageName = $event!.toString();
        $pages.realtime.set('pageName', page.id, $event!.toString())"
      />
    </div>

    <q-separator />

    <!-- Lock position and zoom -->

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Lock position"
        v-model="page.camera.react.lockPos"
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Lock zoom"
        v-model="page.camera.react.lockZoom"
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex; flex-direction: column">
      <GroupSettingsDialog />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { negateProp } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { inject, Ref, ref, watch } from 'vue';

import Checkbox from '../../misc/Checkbox.vue';
import MiniSidebarBtn from '../../misc/MiniSidebarBtn.vue';
import GroupSettingsDialog from './GroupSettingsDialog/GroupSettingsDialog.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const pageName = ref('');

watch(
  page,
  async () => {
    pageName.value =
      (await $pages.realtime.getAsync('pageName', page.value.id)) ?? '';
  },
  { immediate: true }
);
</script>
