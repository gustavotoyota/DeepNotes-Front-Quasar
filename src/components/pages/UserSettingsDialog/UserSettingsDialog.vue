<template>
  <q-dialog
    v-model="visible"
    :maximized="maximized"
  >
    <q-card
      style="display: flex; flex-direction: column; max-width: unset"
      :style="{
        width: maximized ? undefined : '750px',
        height: maximized ? undefined : '550px',
      }"
    >
      <q-card-section style="display: flex">
        <div class="text-h5">User Settings</div>

        <q-space />

        <q-btn
          icon="mdi-close"
          color="primary"
          flat
          round
          style="margin: -5px; height: 42px"
          v-close-popup
        />
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
            icon="mdi-account"
            label="General"
          />
          <q-tab
            name="Groups"
            icon="mdi-account-group"
            label="Groups"
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
            icon="mdi-account"
            :settings="settings"
          />
          <TabBtn
            name="Groups"
            icon="mdi-account-group"
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
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
declare module 'src/code/app/internals' {
  export interface DeepNotesInternals {
    showUserSettingsDialog: () => any;
  }
}

export interface IGroupData {
  groupId: string;
  ownerId: string;
  roleId: string;
  mainPageId: string;

  encryptedSymmetricKey: string | null;
  encryptersPublicKey: string | null;
}

export function initialSettings() {
  return {
    loaded: false,

    tab: 'General',

    general: {
      displayName: '',
    },
    groups: {
      list: [] as IGroupData[],

      selectedIds: new Set<string>(),
    },
    invitations: {
      list: [] as IGroupData[],

      selectedIds: new Set<string>(),
    },
    requests: {
      list: [] as IGroupData[],

      selectedIds: new Set<string>(),
    },
  };
}
</script>

<script
  setup
  lang="ts"
>
import { Notify } from 'quasar';
import { saveGroupSymmetricKey } from 'src/code/app/crypto/crypto';
import { internals } from 'src/code/app/internals';
import { DICT_GROUP_OWNER_ID } from 'src/code/app/pages/pages';
import { REALTIME_USER_DISPLAY_NAME } from 'src/code/app/pages/realtime';
import { BREAKPOINT_MD_MIN } from 'src/code/lib/responsive';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import TabBtn from 'src/components/misc/TabBtn.vue';
import { useUI } from 'src/stores/ui';
import { computed, provide, ref } from 'vue';

import GeneralTab from './GeneralTab.vue';
import GroupsTab from './GroupsTab.vue';
import InvitationsTab from './InvitationsTab.vue';
import RequestsTab from './RequestsTab.vue';

const ui = useUI();

const maximized = computed(() => ui.width < BREAKPOINT_MD_MIN);

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

internals.showUserSettingsDialog = async () => {
  try {
    visible.value = true;

    settings.value = initialSettings();

    const [request, displayName] = await Promise.all([
      internals.api.post<{
        groups: IGroupData[];
        invitations: IGroupData[];
        requests: IGroupData[];
      }>('/api/users/load-settings'),

      $pages.realtime.getAsync(REALTIME_USER_DISPLAY_NAME, $pages.react.userId),
    ]);

    settings.value.general.displayName = displayName!;

    settings.value.groups.list = request.data.groups;
    settings.value.invitations.list = request.data.invitations;
    settings.value.requests.list = request.data.requests;

    request.data.groups
      .concat(request.data.invitations)
      .concat(request.data.requests)
      .forEach((group) => {
        $pages.react.dict[`${DICT_GROUP_OWNER_ID}:${group.groupId}`] =
          group.ownerId;

        if (
          group.encryptedSymmetricKey != null &&
          group.encryptersPublicKey != null
        ) {
          saveGroupSymmetricKey(
            group.groupId,
            group.encryptedSymmetricKey,
            group.encryptersPublicKey
          );
        }
      });

    settings.value.loaded = true;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
};
</script>
