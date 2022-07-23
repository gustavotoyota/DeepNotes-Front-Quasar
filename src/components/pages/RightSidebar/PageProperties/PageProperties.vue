<template>
  <q-list v-if="!ui.rightSidebarExpanded"> </q-list>

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
import { AppPage } from 'src/code/app/pages/page/page';
import { useUI } from 'src/stores/ui';
import {
  inject,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  watch,
  WatchStopHandle,
} from 'vue';

import GroupSettingsDialog from './GroupSettingsDialog/GroupSettingsDialog.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const pageTitle = ref('');
const pageTitleElem = ref();

let unwatch: WatchStopHandle;

onMounted(() => {
  unwatch = watch(
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
});

onBeforeUnmount(() => {
  unwatch?.();
});
</script>
