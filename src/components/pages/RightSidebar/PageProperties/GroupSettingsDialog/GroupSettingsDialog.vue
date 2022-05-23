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
            :active="settings.tab === 'roles'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="settings.tab = 'roles'"
          >
            <q-item-section>Roles</q-item-section>
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
          <RolesTab
            ref="rolesTab"
            v-show="settings.tab === 'roles'"
          />
          <UsersTab
            ref="usersTab"
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
export interface IGroupRole {
  id: string;
  name: string;
  description: string;
  rank: number;
  permissions: {
    manageOwnRank: boolean;
    manageLowerRanks: boolean;

    editGroupSettings: boolean;
    editPages: boolean;
  };
}

export interface IGroupUser {
  id: string;
  roleId: string;
  displayName: string;
}

export function initialSettings() {
  return {
    loaded: false,

    tab: 'general',

    general: {
      groupName: '',
    },

    roles: {
      list: [] as IGroupRole[],

      selectedIds: new Set<string>(),

      newRole: {
        name: '',
        rank: '',
      },
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
import RolesTab from './RolesTab.vue';
import UsersTab from './UsersTab.vue';

const visible = ref(false);

const settings = ref(initialSettings());
provide('settings', settings);

const page = inject<Ref<AppPage>>('page')!;

const generalTab = ref() as Ref<InstanceType<typeof GeneralTab>>;
const rolesTab = ref() as Ref<InstanceType<typeof RolesTab>>;
const usersTab = ref() as Ref<InstanceType<typeof UsersTab>>;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  settings.value = initialSettings();

  const response = await $api.post<{
    roles: IGroupRole[];

    users: IGroupUser[];
  }>('/api/groups/load-settings', {
    groupId: page.value.react.groupId,
  });

  settings.value.general.groupName =
    $pages.realtime.values[`groupName.${page.value.react.groupId}`];

  settings.value.roles.list = response.data.roles;
  settings.value.users.list = response.data.users;

  settings.value.loaded = true;
});
</script>
