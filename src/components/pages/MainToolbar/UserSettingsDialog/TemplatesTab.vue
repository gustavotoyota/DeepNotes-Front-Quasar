<template>
  <div style="color: #a0a0a0">
    Drag and drop templates to change their order.
  </div>

  <Gap style="height: 16px" />

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
        <draggable
          v-model="$pages.templates.react.list"
          item-key="id"
        >
          <template #item="{ element: template }">
            <q-item
              class="text-grey-1"
              style="background-color: #424242"
              clickable
              v-ripple
              active-class="bg-grey-7"
              :active="settings.templates.selectedIds.has(template.id)"
              @click="select(template.id, $event)"
            >
              <q-item-section>{{ template.name }}</q-item-section>

              <q-item-section
                v-if="template.id === $pages.templates.react.defaultId"
                side
              >
                <q-icon name="mdi-check-circle" />
              </q-item-section>

              <q-item-section side>
                <q-icon :name="template.visible ? 'mdi-eye' : 'mdi-eye-off'" />
              </q-item-section>
            </q-item>
          </template>
        </draggable>
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
      <q-input
        label="Template name"
        filled
        dense
        :disable="selected == null"
        :model-value="selected?.name"
        @update:model-value="selected!.name = $event!.toString()"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Set as default"
        color="primary"
        :disable="
          selected == null || selected.id == $pages.templates.react.defaultId
        "
        @click="$pages.templates.react.defaultId = selected?.id ?? ''"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Toggle visibility"
        color="primary"
        :disable="settings.templates.selectedIds.size === 0"
        @click="toggleVisibility()"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Delete"
        color="primary"
        :disable="settings.templates.selectedIds.size === 0"
        @click="deleteSelection()"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { remove } from 'lodash';
import { Notify } from 'quasar';
import { ITemplate } from 'src/code/pages/app/templates';
import Gap from 'src/components/misc/Gap.vue';
import { computed, inject, Ref } from 'vue';
import draggable from 'vuedraggable';

import { initialSettings } from './UserSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selected = computed(() => {
  if (settings.value.templates.selectedIds.size !== 1) {
    return null;
  }

  return $pages.templates.react.list.find(
    (item) =>
      item.id === settings.value.templates.selectedIds.values().next().value
  ) as ITemplate;
});

function selectAll() {
  for (const template of $pages.templates.react.list) {
    settings.value.templates.selectedIds.add(template.id);
  }
}
function deselectAll() {
  for (const template of $pages.templates.react.list) {
    settings.value.templates.selectedIds.delete(template.id);
  }
}

function select(templateId: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    settings.value.templates.selectedIds.clear();
  }

  toggleSelection(templateId);
}
function toggleSelection(templateId: string) {
  if (settings.value.templates.selectedIds.has(templateId)) {
    settings.value.templates.selectedIds.delete(templateId);
  } else {
    settings.value.templates.selectedIds.add(templateId);
  }
}

function toggleVisibility() {
  let allVisible = true;
  for (const templateId of settings.value.templates.selectedIds) {
    const template = $pages.templates.react.list.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if (template.visible) continue;

    allVisible = false;
    break;
  }

  for (const templateId of settings.value.templates.selectedIds) {
    const template = $pages.templates.react.list.find(
      (item) => item.id === templateId
    ) as ITemplate;

    template.visible = !allVisible;
  }
}

function deleteSelection() {
  // Check if default template is selected

  for (const templateId of settings.value.templates.selectedIds) {
    const template = $pages.templates.react.list.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if ($pages.templates.react.defaultId !== template.id) continue;

    Notify.create({
      message: 'Default template cannot be deleted',
      color: 'negative',
    });

    return;
  }

  remove($pages.templates.react.list, (template) =>
    settings.value.templates.selectedIds.has(template.id)
  );

  settings.value.templates.selectedIds.clear();
}
</script>
