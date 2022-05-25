<template>
  <div style="display: contents">
    <q-input
      label="Group name"
      :model-value="settings.general.groupName"
      @update:model-value="settings.general.groupName = $event as string;
      $pages.realtime.set('groupName', page.groupId, $event as string)"
      filled
      style="max-width: 300px"
    />
  </div>
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
</script>
