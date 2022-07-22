<template>
  <slot :show-dialog="showDialog"></slot>

  <q-dialog
    v-model="visible"
    :maximized="maximized"
  >
    <q-card
      style="display: flex; flex-direction: column; max-width: unset"
      :style="{
        width: maximized ? undefined : '800px',
        height: maximized ? undefined : '600px',
      }"
    >
      <q-card-section>
        <div class="text-h5">Group Settings</div>
      </q-card-section>

      <template v-if="maximized">
        <q-separator />

        <q-tabs
          v-model="settings.tab"
          inline-label
          outside-arrows
          mobile-arrows
        >
          <q-tab
            name="General"
            icon="mdi-account-group"
            label="General"
          />
          <q-tab
            name="Members"
            icon="mdi-wallet-membership"
            label="Members"
          />
          <q-tab
            name="Invitations"
            icon="mdi-calendar"
            label="Invitations"
          />
          <q-tab
            name="Requests"
            icon="mdi-account-multiple-plus"
            label="Requests"
          />
        </q-tabs>
      </template>

      <q-separator />

      <q-card-section style="flex: 1; height: 0; display: flex; padding: 0">
        <q-list
          style="flex: none; width: 180px"
          class="d-none d-md-block"
        >
          <TabBtn
            name="General"
            icon="mdi-account-group"
            :settings="settings"
          />
          <TabBtn
            name="Members"
            icon="mdi-wallet-membership"
            :settings="settings"
          />
          <TabBtn
            name="Invitations"
            icon="mdi-calendar"
            :settings="settings"
          />
          <TabBtn
            name="Requests"
            icon="mdi-account-multiple-plus"
            :settings="settings"
          />
        </q-list>

        <q-separator
          vertical
          class="d-none d-md-block"
        />

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
import { AppPage } from 'src/code/pages/page/page';
import { REALTIME_ENCRYPTED_GROUP_NAME } from 'src/code/pages/realtime';
import { internals } from 'src/code/static/internals';
import { BREAKPOINT_MD_MIN } from 'src/code/static/responsive';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import TabBtn from 'src/components/pages/misc/TabBtn.vue';
import { useUI } from 'src/stores/pages/ui';
import { computed, inject, provide, Ref, ref } from 'vue';

import GeneralTab from './GeneralTab.vue';
import InvitationsTab from './InvitationsTab/InvitationsTab.vue';
import MembersTab from './MembersTab/MembersTab.vue';
import RequestsTab from './RequestsTab/RequestsTab.vue';

const ui = useUI();

const maximized = computed(() => ui.width < BREAKPOINT_MD_MIN);

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

const page = inject<Ref<AppPage>>('page')!;

async function showDialog() {
  visible.value = true;

  settings.value = initialSettings();

  const [response] = await Promise.all([
    internals.api.post<{
      requests: IGroupUser[];
      invitations: IGroupUser[];
      members: IGroupUser[];
      banned: IGroupUser[];
    }>('/api/groups/load-settings', {
      groupId: page.value.react.groupId,
    }),

    $pages.realtime.getAsync(
      REALTIME_ENCRYPTED_GROUP_NAME,
      page.value.react.groupId
    ),
  ]);

  settings.value.general.groupName = page.value.react.groupName ?? '';

  settings.value.requests.list = response.data.requests;
  settings.value.invitations.list = response.data.invitations;
  settings.value.members.list = response.data.members;

  settings.value.loaded = true;
}
</script>
