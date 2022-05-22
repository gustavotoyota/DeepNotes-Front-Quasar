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
        width: 900px;
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
            :active="data.tab === 'general'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="data.tab = 'general'"
          >
            <q-item-section>General</q-item-section>
          </q-item>

          <q-item
            clickable
            :active="data.tab === 'roles'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="data.tab = 'roles'"
          >
            <q-item-section>Roles</q-item-section>
          </q-item>

          <q-item
            clickable
            :active="data.tab === 'users'"
            active-class="bg-grey-9 text-grey-1"
            v-ripple
            @click="data.tab = 'users'"
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
            v-show="data.tab === 'general'"
          />
          <RolesTab
            ref="rolesTab"
            v-show="data.tab === 'roles'"
            :roles="data.roles"
          />
          <UsersTab
            ref="usersTab"
            v-show="data.tab === 'users'"
          />

          <LoadingOverlay v-if="!data.loaded" />
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

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { IRole } from 'src/code/pages/static/types';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { inject, Ref, ref, watch } from 'vue';

import GeneralTab from './GeneralTab.vue';
import RolesTab from './RolesTab.vue';
import UsersTab from './UsersTab.vue';

const visible = ref(false);

const data = ref({
  loaded: false,

  tab: 'general',

  roles: [] as IRole[],
});

const page = inject<Ref<AppPage>>('page')!;

const generalTab = ref() as Ref<InstanceType<typeof GeneralTab>>;
const rolesTab = ref() as Ref<InstanceType<typeof RolesTab>>;
const usersTab = ref() as Ref<InstanceType<typeof UsersTab>>;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  data.value = {
    loaded: false,

    tab: 'general',

    roles: [] as IRole[],
  };

  data.value.loaded = false;

  data.value.tab = 'general';

  const response = await $api.post<{
    roles: IRole[];

    users: {
      id: string;
      role_id: string;
    }[];
  }>('/api/groups/load-settings', {
    groupId: page.value.react.groupId,
  });

  generalTab.value.groupName =
    $pages.realtime.values[`groupName.${page.value.react.groupId}`];

  data.value.roles = response.data.roles;
  usersTab.value.users = response.data.users;

  data.value.loaded = true;
});
</script>
