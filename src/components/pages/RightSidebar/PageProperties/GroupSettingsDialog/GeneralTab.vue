<template>
  <div style="display: contents">
    <q-input
      label="Group name"
      v-model="settings.general.groupName"
      filled
      style="max-width: 300px"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { inject, Ref } from 'vue';

import { initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;
</script>
