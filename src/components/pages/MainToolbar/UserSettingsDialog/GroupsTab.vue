<template>
  <div v-if="settings.groups.list.length === 0">
    You are not a member of any group.
  </div>
  <div v-else>
    You are a member of these groups:

    <Gap style="height: 16px" />
  </div>

  <q-list style="border-radius: 10px; padding: 0; overflow-y: auto">
    <q-item
      v-for="group in settings.groups.list"
      :key="group.groupId"
      class="text-grey-1"
      style="background-color: #424242"
    >
      <q-item-section>
        {{ $pages.computeGroupName(group.groupId) }}
      </q-item-section>

      <q-item-section side>
        <q-btn
          label="Go to main page"
          color="primary"
          flat
          :to="`/pages/${group.mainPageId}`"
        />
      </q-item-section>

      <q-item-section side>
        <q-btn
          label="Leave"
          color="negative"
          flat
          @click="leaveGroup(group.groupId)"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script
  setup
  lang="ts"
>
import { remove } from 'lodash';
import Gap from 'src/components/misc/Gap.vue';
import { inject, Ref } from 'vue';

import { initialSettings } from './UserSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

async function leaveGroup(groupId: string) {
  await $api.post('/api/groups/leave', {
    groupId,
  });

  remove(settings.value.groups.list, { groupId });
}
</script>
