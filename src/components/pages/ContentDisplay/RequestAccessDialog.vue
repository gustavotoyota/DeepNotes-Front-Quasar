<template>
  <q-btn
    label="Request access"
    color="primary"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Request access</div>
        </q-card-section>

        <q-separator />

        <q-card-section
          style="padding: 21px; display: flex; flex-direction: column"
        >
          <q-input
            label="Message (optional)"
            type="textarea"
            filled
            dense
            v-model="message"
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
            @click.prevent="requestAccess(message)"
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
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, ref, watch } from 'vue';

const visible = ref(false);

const message = ref('');

const page = inject<AppPage>('page')!;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  message.value = '';
});

async function requestAccess(message: string) {
  await $api.post('/api/groups/access-request/send', {
    groupId: page.groupId,
    pageId: page.id,
    message,
  });

  page.react.userStatus = 'request';
}
</script>

<style scoped>
.q-textarea :deep(textarea) {
  resize: none;
}
.q-textarea :deep(.q-field__control) {
  height: 80px;
}
</style>
