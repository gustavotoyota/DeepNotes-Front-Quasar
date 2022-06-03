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
          <TabBtn
            name="General"
            :settings="settings"
          />
          <TabBtn
            name="Members"
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
          <MembersTab v-if="settings.tab === 'Members'" />
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
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
export interface IGroupUser {
  userId: string;
  roleId: string;
  requestPageId?: string;
  publicKey?: string;
}

export function initialSettings() {
  return {
    loaded: false,

    encryptedSymmetricKey: new Uint8Array(),
    encryptersPublicKey: new Uint8Array(),
    sessionKey: new Uint8Array(),

    tab: 'General',

    general: {
      groupName: '',
    },
    members: {
      list: [] as IGroupUser[],

      selectedIds: new Set<string>(),
    },
    invitations: {
      list: [] as IGroupUser[],

      selectedIds: new Set<string>(),
    },
    requests: {
      list: [] as IGroupUser[],

      selectedIds: new Set<string>(),

      roleId: null,
    },
  };
}
</script>

<script
  setup
  lang="ts"
>
import { from_base64 } from 'libsodium-wrappers';
import { AppPage } from 'src/code/pages/app/page/page';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import TabBtn from 'src/components/pages/misc/TabBtn.vue';
import { inject, provide, Ref, ref, watch } from 'vue';

import GeneralTab from './GeneralTab.vue';
import InvitationsTab from './InvitationsTab/InvitationsTab.vue';
import MembersTab from './MembersTab/MembersTab.vue';
import RequestsTab from './RequestsTab/RequestsTab.vue';

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
    encryptedSymmetricKey: string;
    encryptersPublicKey: string;
    sessionKey: string;

    requests: IGroupUser[];
    invitations: IGroupUser[];
    members: IGroupUser[];
    banned: IGroupUser[];
  }>('/api/groups/load-settings', {
    groupId: page.value.react.groupId,
  });

  settings.value.encryptedSymmetricKey = from_base64(
    response.data.encryptedSymmetricKey
  );
  settings.value.encryptersPublicKey = from_base64(
    response.data.encryptersPublicKey
  );
  settings.value.sessionKey = from_base64(response.data.sessionKey);

  if (page.value.react.ownerId == null) {
    settings.value.general.groupName =
      (await $pages.realtime.getAsync('groupName', page.value.react.groupId)) ??
      '';
  }

  settings.value.requests.list = response.data.requests;
  settings.value.invitations.list = response.data.invitations;
  settings.value.members.list = response.data.members;

  settings.value.loaded = true;
});
</script>
