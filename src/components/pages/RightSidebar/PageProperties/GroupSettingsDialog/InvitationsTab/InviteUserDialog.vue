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
            label="E-mail or User ID"
            filled
            dense
            v-model="identity"
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
            :loading="loading"
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
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { reencryptSymmetricKey } from 'src/code/crypto/crypto';
import { AppPage } from 'src/code/pages/app/page/page';
import { roles } from 'src/code/pages/static/roles';
import Gap from 'src/components/misc/Gap.vue';
import { inject, Ref, ref, watch } from 'vue';
import { z } from 'zod';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);
const loading = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const identity = ref<string>('');
const roleId = ref<string | null>(null);

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  identity.value = '';
  roleId.value = null;
});

async function inviteUser() {
  if (
    !z.string().uuid().or(z.string().email()).safeParse(identity.value).success
  ) {
    Notify.create({
      message: 'Invalid user ID.',
      color: 'negative',
    });

    return;
  }

  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role.',
      color: 'negative',
    });

    return;
  }

  try {
    loading.value = true;

    const [inviterKeys, inviteeInfos] = await Promise.all([
      $api.post<{
        sessionKey: string;
        encryptedSymmetricKey: string;
        encryptersPublicKey: string;
      }>('/api/users/keys', {
        groupId: page.value.react.groupId,
      }),

      $api.post<{
        userId: string;
        email: string;
        publicKey: string;
      }>('/api/users/infos', {
        identity: identity.value,
      }),
    ]);

    const reencryptedSymmetricKey = reencryptSymmetricKey(
      sodium.from_base64(inviterKeys.data.sessionKey),
      sodium.from_base64(inviterKeys.data.encryptedSymmetricKey),
      sodium.from_base64(inviterKeys.data.encryptersPublicKey),
      sodium.from_base64(inviteeInfos.data.publicKey)
    );

    await $api.post('/api/groups/access-invitations/send', {
      groupId: page.value.react.groupId,
      userId: inviteeInfos.data.userId,
      roleId: roleId.value,
      encryptedSymmetricKey: sodium.to_base64(reencryptedSymmetricKey),
    });

    settings.value.invitations.list.push({
      userId: inviteeInfos.data.userId,
      roleId: roleId.value,
    });

    visible.value = false;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }

  loading.value = false;
}
</script>
