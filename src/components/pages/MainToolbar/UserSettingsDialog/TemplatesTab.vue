<template>
  <div style="color: #a0a0a0">
    Drag and drop templates to change their order.
  </div>

  <Gap style="height: 16px" />

  <div style="display: flex">
    <q-btn
      label="Select all"
      color="primary"
      :disable="selectedIds.size === $pages.templates.react.list.length"
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
              :active="selectedIds.has(template.id)"
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
        :disable="activeTemplate == null"
        :model-value="activeTemplate?.name"
        @update:model-value="activeTemplate!.name = $event!.toString()"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Set as default"
        color="primary"
        :disable="
          activeTemplate == null ||
          activeTemplate.id == $pages.templates.react.defaultId
        "
        @click="$pages.templates.react.defaultId = activeTemplate?.id ?? ''"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Toggle visibility"
        color="primary"
        :disable="selectedIds.size === 0"
        @click="toggleVisibility()"
      />

      <Gap style="height: 16px" />

      <q-btn
        label="Delete"
        color="primary"
        :disable="selectedIds.size === 0"
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

const selectedIds = computed(() => settings.value.templates.selectedIds);

const activeTemplate = computed(() => {
  if (selectedIds.value.size !== 1) {
    return null;
  }

  return $pages.templates.react.list.find(
    (item) => item.id === selectedIds.value.values().next().value
  )!;
});

function selectAll() {
  for (const template of $pages.templates.react.list) {
    selectedIds.value.add(template.id);
  }
}
function deselectAll() {
  for (const template of $pages.templates.react.list) {
    selectedIds.value.delete(template.id);
  }
}

function select(templateId: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    selectedIds.value.clear();
  }

  if (selectedIds.value.has(templateId)) {
    selectedIds.value.delete(templateId);
  } else {
    selectedIds.value.add(templateId);
  }
}

function toggleVisibility() {
  let allVisible = true;
  for (const templateId of selectedIds.value) {
    const template = $pages.templates.react.list.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if (template.visible) continue;

    allVisible = false;
    break;
  }

  for (const templateId of selectedIds.value) {
    const template = $pages.templates.react.list.find(
      (item) => item.id === templateId
    ) as ITemplate;

    template.visible = !allVisible;
  }
}

function deleteSelection() {
  // Check if default template is selected

  for (const templateId of selectedIds.value) {
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
    selectedIds.value.has(template.id)
  );

  selectedIds.value.clear();
}
</script>
