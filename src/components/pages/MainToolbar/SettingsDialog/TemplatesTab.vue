<template>
  <div style="display: contents">
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
          <draggable
            v-model="templates"
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
                  v-if="template.id === defaultId"
                  side
                >
                  <q-icon name="mdi-check-circle" />
                </q-item-section>

                <q-item-section side>
                  <q-icon
                    :name="template.visible ? 'mdi-eye' : 'mdi-eye-off'"
                  />
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
          :disable="selected == null || selected.id == defaultId"
          @click="defaultId = selected?.id ?? ''"
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
import { computed, reactive, ref } from 'vue';
import draggable from 'vuedraggable';

const templates = ref([] as ITemplate[]);
const defaultId = ref('');

const selectedIds = reactive(new Set<string>());

const selected = computed(() => {
  if (selectedIds.size !== 1) {
    return null;
  }

  return templates.value.find(
    (item) => item.id === selectedIds.values().next().value
  ) as ITemplate;
});

function selectAll() {
  for (const template of templates.value) {
    selectedIds.add(template.id);
  }
}
function deselectAll() {
  for (const template of templates.value) {
    selectedIds.delete(template.id);
  }
}

function select(templateId: string, event: MouseEvent) {
  if (!event.ctrlKey) {
    selectedIds.clear();
  }

  toggleSelection(templateId);
}
function toggleSelection(templateId: string) {
  if (selectedIds.has(templateId)) {
    selectedIds.delete(templateId);
  } else {
    selectedIds.add(templateId);
  }
}

function toggleVisibility() {
  let allVisible = true;
  for (const templateId of selectedIds) {
    const template = templates.value.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if (template.visible) continue;

    allVisible = false;
    break;
  }

  for (const templateId of selectedIds) {
    const template = templates.value.find(
      (item) => item.id === templateId
    ) as ITemplate;

    template.visible = !allVisible;
  }
}

function deleteSelection() {
  // Check if default template is selected

  for (const templateId of selectedIds) {
    const template = templates.value.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if (defaultId.value !== template.id) continue;

    Notify.create({
      message: 'Default template cannot be deleted',
      color: 'negative',
    });

    return;
  }

  remove(templates.value, (template) => selectedIds.has(template.id));

  selectedIds.clear();
}

async function save() {
  $pages.templates.react.list = templates.value;
  $pages.templates.react.defaultId = defaultId.value;

  await $api.post('/api/templates/update-settings', {
    templates: templates.value,
    defaultTemplateId: defaultId.value,
  });

  console.log('Template settings save request sent');
}

defineExpose({
  templates,
  defaultId,
  selectedIds,
  save,
});
</script>
