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
            v-for="role in settings.roles.list"
            :key="role.id"
            class="text-grey-1"
            style="background-color: #424242"
            clickable
            v-ripple
            active-class="bg-grey-7"
            :active="settings.roles.selectedIds.has(role.id)"
            @click="select(role.id, $event)"
          >
            <q-item-section>
              {{ role.name }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div
        style="
          flex: none;
          margin-left: 16px;
          width: 250px;
          display: flex;
          flex-direction: column;
        "
      >
        <div style="display: flex">
          <q-input
            label="Role name"
            filled
            dense
            :disable="activeRole == null"
            :model-value="activeRole?.name"
            @update:model-value="activeRole!.name = $event!.toString()"
          />

          <Gap style="width: 16px" />

          <q-input
            label="Rank"
            filled
            dense
            :disable="activeRole == null"
            :model-value="activeRole?.rank"
            @update:model-value="activeRole!.rank = parseInt($event!.toString()) || 0"
          />
        </div>

        <Gap style="height: 16px" />

        <q-btn
          label="Add"
          color="primary"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Delete"
          color="primary"
          :disable="settings.roles.selectedIds.size === 0"
        />

        <Gap style="height: 16px" />

        <Checkbox
          label="Can edit pages"
          style="flex: none"
          :disable="activeRole == null"
          :model-value="activeRole?.permissions.editPages ?? false"
          @update:model-value="activeRole!.permissions.editPages = $event"
        />

        <Gap style="height: 16px" />

        <Checkbox
          label="Can manage own rank"
          style="flex: none"
          :disable="activeRole == null"
          :model-value="activeRole?.permissions.manageOwnRank ?? false"
          @update:model-value="activeRole!.permissions.manageOwnRank = $event"
        />

        <Gap style="height: 16px" />

        <Checkbox
          label="Can manage lower ranks"
          style="flex: none"
          :disable="activeRole == null"
          :model-value="activeRole?.permissions.manageLowerRanks ?? false"
          @update:model-value="activeRole!.permissions.manageLowerRanks = $event"
        />
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import {} from '@vue/reactivity';
import Gap from 'src/components/misc/Gap.vue';
import Checkbox from 'src/components/pages/misc/Checkbox.vue';
import { computed, inject, Ref } from 'vue';

import { initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const activeRole = computed(() => {
  if (settings.value.roles.selectedIds.size !== 1) {
    return null;
  }

  return settings.value.roles.list.find(
    (item) => item.id === settings.value.roles.selectedIds.values().next().value
  );
});

function selectAll() {
  for (const role of settings.value.roles.list) {
    settings.value.roles.selectedIds.add(role.id);
  }
}
function deselectAll() {
  for (const role of settings.value.roles.list) {
    settings.value.roles.selectedIds.delete(role.id);
  }
}

function select(id: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    settings.value.roles.selectedIds.clear();
  }

  toggleSelection(id);
}
function toggleSelection(id: string) {
  if (settings.value.roles.selectedIds.has(id)) {
    settings.value.roles.selectedIds.delete(id);
  } else {
    settings.value.roles.selectedIds.add(id);
  }
}
</script>
