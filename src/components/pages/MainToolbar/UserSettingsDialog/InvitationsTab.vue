<template>
  <div v-if="settings.invitations.list.length === 0">
    You don't have any pending group access invitations.
  </div>
  <div v-else>
    You were invited to these groups:

    <Gap style="height: 16px" />
  </div>

  <q-list style="border-radius: 10px; padding: 0; overflow-y: auto">
    <q-item
      v-for="group in settings.invitations.list"
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
          label="Accept"
          color="positive"
          flat
        />
      </q-item-section>

      <q-item-section side>
        <q-btn
          label="Reject"
          color="negative"
          flat
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script
  setup
  lang="ts"
>
import Gap from 'src/components/misc/Gap.vue';
import { inject, Ref } from 'vue';

import { initialSettings } from './UserSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;
</script>
