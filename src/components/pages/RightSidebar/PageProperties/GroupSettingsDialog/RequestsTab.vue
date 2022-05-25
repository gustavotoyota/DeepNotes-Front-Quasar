<template>
  <div style="display: contents">
    <q-list
      style="
        border-radius: 10px;
        max-height: 100%;
        padding: 0;
        overflow-y: auto;
      "
    >
      <q-item
        v-for="user in settings.requests.list"
        :key="user.id"
        class="text-grey-1"
        style="background-color: #424242"
      >
        <q-item-section>
          {{ $pages.realtime.get('userName', user.id) }}
        </q-item-section>

        <q-item-section side>
          <q-select
            label="Role"
            filled
            dense
            :options="roles"
            option-label="name"
            option-value="id"
            map-options
            emit-value
            v-model="user.roleId"
            style="width: 150px"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            label="Accept"
            color="positive"
            flat
            @click="acceptRequest(user)"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            label="Reject"
            color="negative"
            flat
            @click="rejectRequest(user)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { pull } from 'lodash';
import { AppPage } from 'src/code/pages/app/page/page';
import { roles } from 'src/code/pages/static/roles';
import { inject, Ref } from 'vue';

import { IGroupUser, initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const page = inject<Ref<AppPage>>('page')!;

async function acceptRequest(user: IGroupUser) {
  await $api.post('/api/groups/accept-request', {
    groupId: page.value.groupId,
    userId: user.id,
    roleId: user.roleId,
  });

  pull(settings.value.requests.list, user);
}
async function rejectRequest(user: IGroupUser) {
  await $api.post('/api/groups/reject-request', {
    groupId: page.value.groupId,
    userId: user.id,
  });

  pull(settings.value.requests.list, user);
}
</script>
