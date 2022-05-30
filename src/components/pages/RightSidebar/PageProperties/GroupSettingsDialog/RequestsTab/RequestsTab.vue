<template>
  <template v-if="settings.requests.list.length === 0">
    No access requests available.
  </template>

  <template v-else>
    <div style="display: flex">
      <q-btn
        label="Select all"
        color="primary"
        :disable="selectedIds.size === settings.requests.list.length"
        @click="selectAll()"
      />

      <Gap style="width: 16px" />

      <q-btn
        label="Clear selection"
        color="primary"
        :disable="selectedIds.size === 0"
        @click="deselectAll()"
      />
    </div>

    <Gap style="height: 16px" />

    <div style="flex: 1; height: 0; display: flex">
      <div style="flex: 1">
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
            :key="user.userId"
            class="text-grey-1"
            style="background-color: #424242"
            clickable
            v-ripple
            active-class="bg-grey-7"
            :active="selectedIds.has(user.userId)"
            @click="select(user.userId, $event)"
          >
            <q-item-section>
              {{ $pages.realtime.get('userName', user.userId) }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <Gap style="width: 16px" />

      <div
        style="flex: none; width: 200px; display: flex; flex-direction: column"
      >
        <AcceptRequestDialog />

        <Gap style="height: 16px" />

        <q-btn
          label="Reject"
          color="negative"
          :disable="selectedIds.size === 0"
          @click="rejectSelectedRequests()"
        />
      </div>
    </div>
  </template>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import Gap from 'src/components/misc/Gap.vue';
import { computed, inject, Ref } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';
import AcceptRequestDialog from './AcceptRequestDialog.vue';

const page = inject<Ref<AppPage>>('page')!;

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.requests.selectedIds);

function selectAll() {
  for (const role of settings.value.requests.list) {
    selectedIds.value.add(role.userId);
  }
}
function deselectAll() {
  for (const role of settings.value.requests.list) {
    selectedIds.value.delete(role.userId);
  }
}

function select(id: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    selectedIds.value.clear();
  }

  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
}

async function rejectSelectedRequests() {
  await $api.post('/api/groups/access-requests/reject', {
    groupId: page.value.groupId,
    userIds: Array.from(selectedIds.value),
  });

  settings.value.requests.list = settings.value.requests.list.filter(
    (user) => !selectedIds.value.has(user.userId)
  );
  selectedIds.value.clear();
}
</script>