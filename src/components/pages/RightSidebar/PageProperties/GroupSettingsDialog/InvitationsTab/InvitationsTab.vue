<template>
  <div v-if="settings.invitations.list.length === 0">
    No access invitations pending.
  </div>

  <q-list
    style="border-radius: 10px; max-height: 100%; padding: 0; overflow-y: auto"
  >
    <q-item
      v-for="user in settings.invitations.list"
      :key="user.id"
      class="text-grey-1"
      style="background-color: #424242"
    >
      <q-item-section>
        <q-item-label>
          {{ $pages.realtime.get('userName', user.id) }}
        </q-item-label>
        <q-item-label caption>
          {{ rolesMap[user.roleId].name }}
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-btn
          label="Cancel"
          color="negative"
          flat
        />
      </q-item-section>
    </q-item>
  </q-list>

  <Gap style="height: 16px" />

  <InviteUserDialog />
</template>

<script
  setup
  lang="ts"
>
import { rolesMap } from 'src/code/pages/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import { inject, Ref } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';
import InviteUserDialog from './InviteUserDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;
</script>