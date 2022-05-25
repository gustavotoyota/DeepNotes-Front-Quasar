<template>
  <div style="display: contents">
    <q-list
      style="
        border-radius: 10px;
        max-height: 100%;
        padding: 0;
        overflow-y: auto;
      "
    >
      <div v-if="settings.requests.list.length === 0">No access requests</div>

      <q-item
        v-for="user in settings.requests.list"
        :key="user.id"
        class="text-grey-1"
        style="background-color: #424242"
      >
        <q-item-section>
          {{ $pages.realtime.get('userName', user.id) }}
        </q-item-section>

        <q-item-section side>
          <q-select
            label="Role"
            filled
            dense
            :options="roles"
            option-label="name"
            option-value="id"
            map-options
            emit-value
            v-model="user.roleId"
            style="width: 150px"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            label="Accept"
            color="positive"
            flat
            @click="acceptRequest(user)"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            label="Reject"
            color="negative"
            flat
            @click="rejectRequest(user)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { from_base64, to_base64 } from 'libsodium-wrappers';
import { pull } from 'lodash';
import { decryptSymmetric, encryptAssymetric } from 'src/code/crypto/crypto';
import { privateKey } from 'src/code/crypto/private-key';
import { AppPage } from 'src/code/pages/app/page/page';
import { roles } from 'src/code/pages/static/roles';
import { inject, Ref } from 'vue';

import { IGroupUser, initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const page = inject<Ref<AppPage>>('page')!;

async function acceptRequest(user: IGroupUser) {
  const encryptedPrivateKey = from_base64(
    localStorage.getItem('encrypted-private-key')!
  );

  const decryptedPrivateKey = decryptSymmetric(
    encryptedPrivateKey,
    settings.value.sessionKey
  );

  const decryptedSymmetricKey = privateKey.decrypt(
    settings.value.encryptedSymmetricKey,
    settings.value.distributorsPublicKey
  );

  const encryptedSymmetricKey = encryptAssymetric(
    decryptedSymmetricKey,
    from_base64(user.publicKey),
    decryptedPrivateKey
  );

  await $api.post('/api/groups/accept-request', {
    groupId: page.value.groupId,
    userId: user.id,
    roleId: user.roleId,
    encryptedSymmetricKey: to_base64(encryptedSymmetricKey),
  });

  pull(settings.value.requests.list, user);
}
async function rejectRequest(user: IGroupUser) {
  await $api.post('/api/groups/reject-request', {
    groupId: page.value.groupId,
    userId: user.id,
  });

  pull(settings.value.requests.list, user);
}
</script>
