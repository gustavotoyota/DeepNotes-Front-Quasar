<template>
  <div style="display: flex">
    <q-btn
      label="Select all"
      color="primary"
      :disable="selectedIds.size === settings.groups.list.length"
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
      <q-list style="border-radius: 10px; padding: 0; overflow-y: auto">
        <q-item
          v-for="group in settings.groups.list"
          :key="group.groupId"
          class="text-grey-1"
          style="background-color: #424242"
          clickable
          v-ripple
          active-class="bg-grey-7"
          :active="selectedIds.has(group.groupId)"
          @click="select(group.groupId, $event)"
        >
          <q-item-section>
            <q-item-label>
              {{ $pages.react.groupNames[group.groupId] }}
            </q-item-label>
            <q-item-label caption>
              {{ rolesMap[group.roleId].name }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <Gap style="width: 16px" />

    <div
      style="flex: none; width: 200px; display: flex; flex-direction: column"
    >
      <q-btn
        label="Go to main page"
        color="secondary"
        :disable="activeGroup == null"
        :to="`/pages/${activeGroup?.mainPageId}`"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Leave"
        color="negative"
        :disable="selectedIds.size === 0"
        @click="leaveSelectedGroups()"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { Notify } from 'quasar';
import { rolesMap } from 'src/code/pages/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import { computed, inject, Ref } from 'vue';

import { initialSettings } from './UserSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.groups.selectedIds);

const activeGroup = computed(() => {
  if (selectedIds.value.size !== 1) {
    return null;
  }

  return settings.value.groups.list.find(
    (item) => item.groupId === selectedIds.value.values().next().value
  )!;
});

function selectAll() {
  for (const group of settings.value.groups.list) {
    selectedIds.value.add(group.groupId);
  }
}
function deselectAll() {
  for (const group of settings.value.groups.list) {
    selectedIds.value.delete(group.groupId);
  }
}

function select(groupId: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    selectedIds.value.clear();
  }

  if (selectedIds.value.has(groupId)) {
    selectedIds.value.delete(groupId);
  } else {
    selectedIds.value.add(groupId);
  }
}

async function leaveSelectedGroups() {
  try {
    await $api.post('/api/groups/leave', {
      groupIds: Array.from(selectedIds.value),
    });

    settings.value.groups.list = settings.value.groups.list.filter(
      (group) => !selectedIds.value.has(group.groupId)
    );
    selectedIds.value.clear();
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
