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
import { REALTIME_USER_DISPLAY_NAME } from 'src/code/pages/realtime';
import {
  inject,
  onBeforeUnmount,
  onMounted,
  Ref,
  watch,
  WatchStopHandle,
} from 'vue';

import { initialSettings } from './UserSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

let unwatch: WatchStopHandle;

onMounted(() => {
  unwatch = watch(
    () => settings.value.general.displayName,
    (displayName) => {
      $pages.realtime.set(
        REALTIME_USER_DISPLAY_NAME,
        $pages.react.userId,
        displayName
      );
      $pages.react.groupNames[
        $pages.react.mainGroupId
      ] = `${displayName}'s Group`;
    }
  );
});

onBeforeUnmount(() => {
  unwatch?.();
});
</script>
