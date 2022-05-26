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
            :active="settings.tab === 'members'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'members'"
          >
            <q-item-section>Members</q-item-section>
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
            :active="settings.tab === 'invitations'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'invitations'"
          >
            <q-item-section>Invitations</q-item-section>
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
          <RequestsTab v-if="settings.tab === 'requests'" />
          <MembersTab v-if="settings.tab === 'members'" />
          <InvitationsTab v-if="settings.tab === 'invitations'" />

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
  id: string;
  roleId: string;
  requestPageId: string;
  publicKey: string;
}

export function initialSettings() {
  return {
    loaded: false,

    encryptedSymmetricKey: new Uint8Array(),
    distributorsPublicKey: new Uint8Array(),
    sessionKey: new Uint8Array(),

    tab: 'general',

    general: {
      groupName: '',
    },
    requests: {
      list: [] as IGroupUser[],

      selectedIds: new Set<string>(),
    },
    invitations: {
      list: [] as IGroupUser[],

      selectedIds: new Set<string>(),
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
import { from_base64 } from 'libsodium-wrappers';
import { AppPage } from 'src/code/pages/app/page/page';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { inject, provide, Ref, ref, watch } from 'vue';

import GeneralTab from './GeneralTab.vue';
import InvitationsTab from './InvitationsTab.vue';
import MembersTab from './MembersTab/MembersTab.vue';
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
    encryptedSymmetricKey: string;
    distributorsPublicKey: string;
    sessionKey: string;

    requests: IGroupUser[];
    invitations: IGroupUser[];
    members: IGroupUser[];
    banned: IGroupUser[];
  }>('/api/groups/load-settings', {
    groupId: page.value.groupId,
  });

  settings.value.encryptedSymmetricKey = from_base64(
    response.data.encryptedSymmetricKey
  );
  settings.value.distributorsPublicKey = from_base64(
    response.data.distributorsPublicKey
  );
  settings.value.sessionKey = from_base64(response.data.sessionKey);

  settings.value.general.groupName = await $pages.realtime.getAsync(
    'groupName',
    page.value.groupId
  );
  settings.value.requests.list = response.data.requests;
  settings.value.invitations.list = response.data.invitations;
  settings.value.members.list = response.data.members;

  settings.value.loaded = true;
});
</script>
