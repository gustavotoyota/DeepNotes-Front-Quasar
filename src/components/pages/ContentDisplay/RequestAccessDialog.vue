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
          <q-select
            label="Role"
            :options="roles"
            option-label="name"
            option-value="id"
            filled
            emit-value
            map-options
            dense
            v-model="roleId"
          />

          <Gap style="height: 16px" />

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
import { Notify } from 'quasar';
import { AppPage } from 'src/code/pages/app/page/page';
import { roles } from 'src/code/pages/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import { inject, ref, watch } from 'vue';

const visible = ref(false);

const roleId = ref();
const message = ref('');

const page = inject<AppPage>('page')!;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  roleId.value = null;
  message.value = '';
});

async function requestAccess(message: string) {
  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role',
      color: 'negative',
    });

    return;
  }

  try {
    await $api.post('/api/groups/access-requests/send', {
      groupId: page.groupId,
      roleId: roleId.value,
      pageId: page.id,
      message,
    });

    page.react.userStatus = 'request';
  } catch (err: any) {
    Notify.create({
      color: 'negative',
      message: err.response?.data.message ?? 'An error has occurred',
    });
  }

  visible.value = false;
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
