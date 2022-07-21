<template>
  <q-list v-if="!ui.rightSidebarExpanded">
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
    <!-- Page title -->

    <div style="padding: 20px">
      <q-input
        ref="pageTitleElem"
        label="Page title"
        dense
        filled
        :disable="page.react.readonly"
        :model-value="pageTitle"
        @update:model-value="pageTitle = $event!.toString();
        $pages.react.pageTitles[page.id] = $event!.toString()"
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
      <GroupSettingsDialog>
        <template #default="{ showDialog }">
          <q-btn
            label="Group settings"
            color="primary"
            @click="showDialog()"
          />
        </template>
      </GroupSettingsDialog>
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

const pageTitle = ref('');
const pageTitleElem = ref();

watch(
  [pageTitleElem, () => $pages.react.pageTitles[page.value.id]],
  () => {
    if (
      document.activeElement ===
      pageTitleElem.value?.$el.querySelector(':scope input')
    ) {
      return;
    }

    pageTitle.value = $pages.react.pageTitles[page.value.id];
  },
  { immediate: true }
);
</script>
