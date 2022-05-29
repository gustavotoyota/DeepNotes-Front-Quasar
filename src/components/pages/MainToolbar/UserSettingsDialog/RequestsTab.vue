<template>
  <div v-if="settings.requests.list.length === 0">
    There are no pending access requests.
  </div>
  <div v-else>
    You made these access requests:

    <Gap style="height: 16px" />
  </div>

  <q-list style="border-radius: 10px; padding: 0; overflow-y: auto">
    <q-item
      v-for="group in settings.requests.list"
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
          label="Cancel"
          color="negative"
          flat
          @click="cancelRequest(group.groupId)"
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

async function cancelRequest(groupId: string) {
  await $api.post('/api/groups/access-requestss/cancel', {
    groupId,
  });

  remove(settings.value.requests.list, { groupId });
}
</script>
