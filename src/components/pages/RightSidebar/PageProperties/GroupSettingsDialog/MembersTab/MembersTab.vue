<template>
  <div style="display: flex">
    <q-btn
      label="Select all"
      color="primary"
      @click="selectAll()"
    />

    <Gap style="width: 16px" />

    <q-btn
      label="Clear selection"
      color="primary"
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
          v-for="user in settings.members.list"
          :key="user.id"
          class="text-grey-1"
          style="background-color: #424242"
          clickable
          v-ripple
          active-class="bg-grey-7"
          :active="settings.members.selectedIds.has(user.id)"
          @click="select(user.id, $event)"
        >
          <q-item-section>
            <q-item-label>
              {{ $pages.realtime.get('userName', user.id) }}
            </q-item-label>
            <q-item-label caption>
              {{ rolesMap[user.roleId].name }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div
      style="
        flex: none;
        margin-left: 16px;
        width: 200px;
        display: flex;
        flex-direction: column;
      "
    >
      <ChangeRoleDialog
        :disable="!canChangeActiveRole"
        :user="activeUser!"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Remove"
        color="negative"
        :disable="settings.members.selectedIds.size === 0"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { rolesMap } from 'src/code/pages/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import { computed, inject, Ref } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';
import ChangeRoleDialog from './ChangeRoleDialog.vue';

const page = inject<Ref<AppPage>>('page')!;

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const activeUser = computed(() => {
  if (settings.value.members.selectedIds.size !== 1) {
    return null;
  }

  return settings.value.members.list.find(
    (item) =>
      item.id === settings.value.members.selectedIds.values().next().value
  );
});

const canChangeActiveRole = computed(() => {
  if (activeUser.value == null) {
    return false;
  }

  const myRole = rolesMap[page.value.roleId];
  const userRole = rolesMap[activeUser.value.roleId];

  if (myRole.permissions.manageOwnRank && userRole.rank === myRole.rank) {
    return true;
  }

  if (myRole.permissions.manageLowerRanks && userRole.rank < myRole.rank) {
    return true;
  }

  return false;
});

function selectAll() {
  for (const role of settings.value.members.list) {
    settings.value.members.selectedIds.add(role.id);
  }
}
function deselectAll() {
  for (const role of settings.value.members.list) {
    settings.value.members.selectedIds.delete(role.id);
  }
}

function select(id: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    settings.value.members.selectedIds.clear();
  }

  toggleSelection(id);
}
function toggleSelection(id: string) {
  if (settings.value.members.selectedIds.has(id)) {
    settings.value.members.selectedIds.delete(id);
  } else {
    settings.value.members.selectedIds.add(id);
  }
}
</script>
