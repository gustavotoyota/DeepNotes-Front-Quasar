<template>
  <q-btn
    label="Invite new member"
    color="primary"
    style="width: 180px"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Invite user</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="padding: 21px">
          <q-input
            label="User ID"
            filled
            dense
            v-model="userId"
          />

          <Gap style="height: 16px" />

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
            @click.prevent="inviteUser()"
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
import { from_base64, to_base64 } from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { reencryptSymmetricKey } from 'src/code/crypto/crypto';
import { AppPage } from 'src/code/pages/app/page/page';
import { roles } from 'src/code/pages/static/roles';
import { isUuid4 } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import { inject, Ref, ref, watch } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const userId = ref<string>('');
const roleId = ref<string | null>(null);

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  userId.value = '';
  roleId.value = null;
});

async function inviteUser() {
  if (!isUuid4(userId.value)) {
    Notify.create({
      message: 'Invalid user ID',
      color: 'negative',
    });

    return;
  }

  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role',
      color: 'negative',
    });

    return;
  }

  const publicKey = (
    await $api.post<string>('/api/users/public-key', {
      userId: userId.value,
    })
  ).data;

  const reencryptedSymmetricKey = reencryptSymmetricKey(
    settings.value.sessionKey,
    settings.value.encryptedSymmetricKey,
    settings.value.distributorsPublicKey,
    from_base64(publicKey)
  );

  await $api.post('/api/groups/access-invitation/send', {
    groupId: page.value.groupId,
    userId: userId.value,
    roleId: roleId.value,
    encryptedSymmetricKey: to_base64(reencryptedSymmetricKey),
  });
}
</script>
