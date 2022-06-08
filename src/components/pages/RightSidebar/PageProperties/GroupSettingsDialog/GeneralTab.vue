<template>
  <q-input
    label="Group name"
    :model-value="
      userGroup
        ? $pages.react.groupNames[page.react.groupId]
        : settings.general.groupName
    "
    @update:model-value="settings.general.groupName = $event as string;
      $pages.react.groupNames[page.react.groupId] = $event as string"
    filled
    style="max-width: 300px"
    :disable="userGroup"
  />
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, Ref } from 'vue';

import { initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const page = inject<Ref<AppPage>>('page')!;

const userGroup =
  $pages.react.dict[`groupOwnerId.${page.value.react.groupId}`] != null;
</script>
