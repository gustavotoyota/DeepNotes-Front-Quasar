<template>
  <q-input
    label="Group name"
    :model-value="settings.general.groupName"
    @update:model-value="settings.general.groupName = $event as string;
      page.react.groupName = $event as string"
    filled
    style="max-width: 300px"
    :disable="page.react.ownerId != null"
  />
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/app/pages/page/page';
import { inject, Ref } from 'vue';

import { initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const page = inject<Ref<AppPage>>('page')!;
</script>
