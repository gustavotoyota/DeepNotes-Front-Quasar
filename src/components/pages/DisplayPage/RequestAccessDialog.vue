<template>
  <slot :show-dialog="showDialog"></slot>

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

          <SmartBtn
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
import { AppPage } from 'src/code/pages/page/page';
import { internals } from 'src/code/static/internals';
import { roles } from 'src/code/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { inject, ref } from 'vue';

const visible = ref(false);

const roleId = ref();
const message = ref('');

const page = inject<AppPage>('page')!;

function showDialog() {
  visible.value = true;

  roleId.value = null;
  message.value = '';
}

async function requestAccess(message: string) {
  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role.',
      type: 'negative',
    });

    return;
  }

  try {
    await internals.api.post('/api/groups/access-requests/send', {
      groupId: page.react.groupId,
      roleId: roleId.value,
      pageId: page.id,
      message,
    });

    page.react.userStatus = 'request';

    Notify.create({
      message: 'Access request sent.',
      type: 'positive',
    });

    visible.value = false;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
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
