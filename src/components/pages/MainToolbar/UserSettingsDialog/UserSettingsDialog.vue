<template>
  <ToolbarBtn
    tooltip="Settings"
    icon="mdi-cog"
    icon-size="28px"
    round
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card
      style="
        display: flex;
        flex-direction: column;
        max-width: unset;
        width: 750px;
        height: 550px;
      "
    >
      <q-card-section>
        <div class="text-h5">User Settings</div>
      </q-card-section>

      <q-separator />

      <q-card-section style="flex: 1; height: 0; display: flex; padding: 0">
        <q-list style="flex: none; width: 180px">
          <q-item
            clickable
            :active="settings.tab === 'general'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'general'"
          >
            <q-item-section>General</q-item-section>
          </q-item>

          <q-item
            clickable
            :active="settings.tab === 'templates'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'templates'"
          >
            <q-item-section>Templates</q-item-section>
          </q-item>
        </q-list>

        <q-separator vertical />

        <div
          style="
            flex: 1;
            padding: 32px;
            display: flex;
            flex-direction: column;
            position: relative;
          "
        >
          <GeneralTab v-if="settings.tab === 'general'" />
          <TemplatesTab v-if="settings.tab === 'templates'" />

          <LoadingOverlay v-if="!settings.loaded" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          v-close-popup
          @click.prevent="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
export function initialSettings() {
  return {
    loaded: false,

    tab: 'general',

    templates: {
      selectedIds: new Set<string>(),
    },
  };
}
</script>

<script
  setup
  lang="ts"
>
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import ToolbarBtn from 'src/components/pages/misc/ToolbarBtn.vue';
import { provide, ref, watch } from 'vue';

import GeneralTab from './GeneralTab.vue';
import TemplatesTab from './TemplatesTab.vue';

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

watch(visible, async () => {
  if (!visible.value) {
    return;
  }

  settings.value = initialSettings();

  settings.value.loaded = true;
});

async function save() {
  await $api.post('/api/templates/update-settings', {
    templates: $pages.templates.react.list,
    defaultTemplateId: $pages.templates.react.defaultId,
  });
}
</script>
