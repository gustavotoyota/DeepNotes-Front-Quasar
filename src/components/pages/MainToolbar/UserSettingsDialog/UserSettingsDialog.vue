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
          <TabBtn
            name="General"
            :settings="settings"
          />
          <TabBtn
            name="Templates"
            :settings="settings"
          />
          <TabBtn
            name="Groups"
            :settings="settings"
          />
          <TabBtn
            name="Invitations"
            :settings="settings"
          />
          <TabBtn
            name="Requests"
            :settings="settings"
          />
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
          <GeneralTab v-if="settings.tab === 'General'" />
          <TemplatesTab v-if="settings.tab === 'Templates'" />
          <GroupsTab v-if="settings.tab === 'Groups'" />
          <InvitationsTab v-if="settings.tab === 'Invitations'" />
          <RequestsTab v-if="settings.tab === 'Requests'" />

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
export interface IGroupData {
  groupId: string;
  ownerId: string;
  roleId: string;
  mainPageId: string;
}

export function initialSettings() {
  return {
    loaded: false,

    tab: 'General',

    templates: {
      selectedIds: new Set<string>(),
    },
    groups: {
      list: [] as IGroupData[],
    },
    invitations: {
      list: [] as IGroupData[],
    },
    requests: {
      list: [] as IGroupData[],
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

import TabBtn from '../../misc/TabBtn.vue';
import GeneralTab from './GeneralTab.vue';
import GroupsTab from './GroupsTab.vue';
import InvitationsTab from './InvitationsTab.vue';
import RequestsTab from './RequestsTab.vue';
import TemplatesTab from './TemplatesTab.vue';

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

watch(visible, async () => {
  if (!visible.value) {
    return;
  }

  settings.value = initialSettings();

  const request = await $api.post<{
    groups: IGroupData[];
    invitations: IGroupData[];
    requests: IGroupData[];
  }>('/api/users/load-settings');

  settings.value.groups.list = request.data.groups;
  settings.value.invitations.list = request.data.invitations;
  settings.value.requests.list = request.data.requests;

  request.data.groups
    .concat(request.data.invitations)
    .concat(request.data.requests)
    .forEach((group) => {
      $pages.react.dict[`groupOwnerId.${group.groupId}`] = group.ownerId;
    });

  settings.value.loaded = true;
});

async function save() {
  await $api.post('/api/templates/update-settings', {
    templates: $pages.templates.react.list,
    defaultTemplateId: $pages.templates.react.defaultId,
  });
}
</script>
