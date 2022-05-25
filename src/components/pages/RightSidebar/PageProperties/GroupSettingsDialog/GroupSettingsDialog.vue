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
            :active="settings.tab === 'requests'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'requests'"
          >
            <q-item-section>Requests</q-item-section>
          </q-item>

          <q-item
            clickable
            :active="settings.tab === 'members'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'members'"
          >
            <q-item-section>Members</q-item-section>
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
          <GeneralTab v-show="settings.tab === 'general'" />
          <RequestsTab v-show="settings.tab === 'requests'" />
          <MembersTab v-show="settings.tab === 'members'" />

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
  roleId: string;
}

export function initialSettings() {
  return {
    loaded: false,

    tab: 'general',

    general: {
      groupName: '',
    },

    members: {
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
import RequestsTab from './RequestsTab.vue';

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

const page = inject<Ref<AppPage>>('page')!;

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

  settings.value.general.groupName = await $pages.realtime.getAsync(
    'groupName',
    page.value.react.groupId
  );

  settings.value.members.list = response.data.users;

  settings.value.loaded = true;
});
</script>
