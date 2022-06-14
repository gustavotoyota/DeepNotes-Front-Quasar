<template>
  <q-input
    label="Display name"
    filled
    v-model="settings.general.displayName"
    style="max-width: 300px"
  />
</template>

<script
  setup
  lang="ts"
>
import { REALTIME_USER_DISPLAY_NAME } from 'src/code/pages/app/realtime';
import { inject, Ref, watch } from 'vue';

import { initialSettings } from './UserSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

watch(
  () => settings.value.general.displayName,
  () => {
    $pages.realtime.set(
      REALTIME_USER_DISPLAY_NAME,
      $pages.react.userId,
      settings.value.general.displayName
    );
  }
);
</script>
