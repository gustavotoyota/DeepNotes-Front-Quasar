<template>
  <q-btn
    label="Save as template"
    color="primary"
    style="flex: 1"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Save as template</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="padding: 21px">
          <q-select
            label="Template name"
            :options="
              $pages.templates.react.list.map((template) => template.name)
            "
            v-model="templateName"
            @input-value="templateName = $event"
            use-input
            filled
            dense
            hide-selected
            fill-input
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <q-btn
            type="submit"
            flat
            label="Ok"
            color="primary"
            v-close-popup
            @click.prevent="saveAsTemplate()"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script
  setup
  lang="ts"
>
import { Notify } from 'quasar';
import { ref } from 'vue';

const visible = ref(false);

const templateName = ref('');

async function saveAsTemplate() {
  const templateData = $pages.serialization.serialize({
    noteIds: [$pages.react.page.activeElem.react.id!],
    arrowIds: [],
  }).notes[0];

  try {
    const response = await $api.post<{
      templateId: string;
    }>('/api/templates/save', {
      name: templateName.value,
      data: templateData,
    });

    const template = $pages.templates.react.list.find(
      (template) => template.name === templateName.value
    );

    if (template != null) {
      template.data = templateData;
    } else {
      $pages.templates.react.list.push({
        id: response.data.templateId,
        name: templateName.value,
        visible: true,
        data: templateData,
      });
    }
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
