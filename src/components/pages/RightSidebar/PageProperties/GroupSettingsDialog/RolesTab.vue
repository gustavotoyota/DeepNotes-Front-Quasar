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
        label="Deselect all"
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
            v-for="role in roles"
            :key="role.id"
            class="text-grey-1"
            style="background-color: #424242"
            clickable
            v-ripple
            active-class="bg-grey-7"
            :active="selectedIds.has(role.id)"
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
            :disable="selected == null"
            :model-value="selected?.name"
            @update:model-value="selected!.name = $event!.toString()"
          />

          <Gap style="width: 16px" />

          <q-input
            label="Rank"
            filled
            dense
            :disable="selected == null"
            :model-value="selected?.rank"
            @update:model-value="selected!.rank = parseInt($event!.toString()) || 0"
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
          :disable="selectedIds.size === 0"
        />

        <Gap style="height: 16px" />

        <Checkbox
          label="Can edit pages"
          style="flex: none"
          :disable="selected == null"
          :model-value="selected?.permissions.editPages ?? false"
          @update:model-value="selected!.permissions.editPages = $event"
        />

        <Gap style="height: 16px" />

        <Checkbox
          label="Can manage own rank"
          style="flex: none"
          :disable="selected == null"
          :model-value="selected?.permissions.manageOwnRank ?? false"
          @update:model-value="selected!.permissions.manageOwnRank = $event"
        />

        <Gap style="height: 16px" />

        <Checkbox
          label="Can manage lower ranks"
          style="flex: none"
          :disable="selected == null"
          :model-value="selected?.permissions.manageLowerRanks ?? false"
          @update:model-value="selected!.permissions.manageLowerRanks = $event"
        />
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { computed } from '@vue/reactivity';
import { IRole } from 'src/code/pages/static/types';
import Gap from 'src/components/misc/Gap.vue';
import Checkbox from 'src/components/pages/misc/Checkbox.vue';
import { reactive } from 'vue';

const props = defineProps<{
  roles: IRole[];
}>();

const selectedIds = reactive(new Set<string>());

const selected = computed(() => {
  if (selectedIds.size !== 1) {
    return null;
  }

  return props.roles.find(
    (item) => item.id === selectedIds.values().next().value
  );
});

function selectAll() {
  for (const role of props.roles) {
    selectedIds.add(role.id);
  }
}
function deselectAll() {
  for (const role of props.roles) {
    selectedIds.delete(role.id);
  }
}

function select(id: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    selectedIds.clear();
  }

  toggleSelection(id);
}
function toggleSelection(id: string) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
}

defineExpose({
  selectedIds,
});
</script>
