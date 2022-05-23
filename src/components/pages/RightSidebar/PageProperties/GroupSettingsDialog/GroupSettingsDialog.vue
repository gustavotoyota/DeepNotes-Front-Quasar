<template>
  <q-btn
    label="Group settings"
    color="primary"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card
      style="
        display: flex;
        flex-direction: column;
        max-width: unset;
        width: 800px;
        height: 600px;
      "
    >
      <q-card-section>
        <div class="text-h5">Group Settings</div>
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
            :active="settings.tab === 'users'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'users'"
          >
            <q-item-section>Users</q-item-section>
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
          <GeneralTab
            ref="generalTab"
            v-show="settings.tab === 'general'"
          />
          <MembersTab
            ref="membersTab"
            v-show="settings.tab === 'users'"
          />

          <LoadingOverlay v-if="!settings.loaded" />
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
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
export interface IGroupUser {
  id: string;
  displayName: string;
  roleId: string;
}

export function initialSettings() {
  return {
    loaded: false,

    tab: 'general',

    general: {
      groupName: '',
    },

    users: {
      list: [] as IGroupUser[],

      selectedIds: new Set<string>(),
    },
  };
}
</script>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { inject, provide, Ref, ref, watch } from 'vue';

import GeneralTab from './GeneralTab.vue';
import MembersTab from './MembersTab.vue';

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

const page = inject<Ref<AppPage>>('page')!;

const generalTab = ref() as Ref<InstanceType<typeof GeneralTab>>;
const membersTab = ref() as Ref<InstanceType<typeof MembersTab>>;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  settings.value = initialSettings();

  const response = await $api.post<{
    users: IGroupUser[];
  }>('/api/groups/load-settings', {
    groupId: page.value.react.groupId,
  });

  settings.value.general.groupName =
    $pages.realtime.values[`groupName.${page.value.react.groupId}`];

  settings.value.users.list = response.data.users;

  settings.value.loaded = true;
});
</script>
