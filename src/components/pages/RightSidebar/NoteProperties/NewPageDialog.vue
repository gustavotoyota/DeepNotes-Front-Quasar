<template>
  <q-btn
    label="Create new page"
    color="primary"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-card-section style="padding: 12px">
        <div class="text-h6">New page</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          label="Page name"
          v-model="pageName"
          filled
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
          flat
          label="Ok"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script
  setup
  lang="ts"
>
import { ref, watch } from 'vue';

const visible = ref(false);

const pageName = ref('');

watch(visible, () => {
  if (visible.value) {
  } else {
  }
});
</script>
