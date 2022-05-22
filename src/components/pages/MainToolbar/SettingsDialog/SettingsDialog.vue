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
            :active="tab === 'general'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="tab = 'general'"
          >
            <q-item-section>General</q-item-section>
          </q-item>

          <q-item
            clickable
            :active="tab === 'templates'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="tab = 'templates'"
          >
            <q-item-section>Templates</q-item-section>
          </q-item>
        </q-list>

        <q-separator vertical />

        <div
          style="flex: 1; padding: 32px; display: flex; flex-direction: column"
        >
          <GeneralTab
            ref="generalTab"
            v-show="tab === 'general'"
          />
          <TemplatesTab
            ref="templatesTab"
            v-show="tab === 'templates'"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          v-close-popup
        />
        <q-btn
          flat
          label="Ok"
          color="primary"
          v-close-popup
          @click="save()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script
  setup
  lang="ts"
>
import { cloneDeep } from 'lodash';
import ToolbarBtn from 'src/components/pages/misc/ToolbarBtn.vue';
import { nextTick, onMounted, ref, watch } from 'vue';

import GeneralTab from './GeneralTab.vue';
import TemplatesTab from './TemplatesTab.vue';

const visible = ref(false);

const tab = ref('general');

const generalTab = ref({} as InstanceType<typeof GeneralTab>);
const templatesTab = ref({} as InstanceType<typeof TemplatesTab>);

onMounted(() => {
  watch(
    visible,
    async () => {
      if (!visible.value) {
        return;
      }

      await nextTick();

      tab.value = 'general';

      templatesTab.value.templates = cloneDeep($pages.templates.react.list);
      templatesTab.value.defaultId = $pages.templates.react.defaultId;

      templatesTab.value.selectedIds.clear();
    },
    { immediate: true }
  );
});

function save() {
  templatesTab.value.save();
}
</script>
