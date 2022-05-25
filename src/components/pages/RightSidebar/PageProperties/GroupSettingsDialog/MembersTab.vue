<template>
  <div style="display: contents">
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
              {{ $pages.realtime.get('userName', user.id) }}
            </q-item-section>
          </q-item>
        </q-list>

        <Gap style="height: 16px" />

        <q-btn
          label="Invite new user"
          color="primary"
        />
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
        <q-select
          label="Role"
          filled
          dense
          :options="roles"
          option-label="name"
          option-value="id"
          map-options
          emit-value
          :disable="activeUser == null"
          :model-value="activeUser?.roleId"
          @update:model-value="activeUser!.roleId = $event"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Ban"
          color="primary"
          :disable="activeUser == null"
        />
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { roles } from 'src/code/pages/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import { computed, inject, Ref } from 'vue';

import { initialSettings } from './GroupSettingsDialog.vue';

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
