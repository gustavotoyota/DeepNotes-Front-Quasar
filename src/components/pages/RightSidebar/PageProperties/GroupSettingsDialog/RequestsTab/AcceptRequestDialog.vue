<template>
  <slot :show-dialog="() => (visible = true)"></slot>

  <q-dialog v-model="visible">
    <q-card style="width: 250px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Accept requests</div>
        </q-card-section>

        <q-card-section style="padding: 21px">Are you sure?</q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <SmartBtn
            type="submit"
            flat
            label="Ok"
            color="primary"
            @click.prevent="acceptRequests()"
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
import { internals } from 'src/code/pages/static/internals';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { computed, inject, Ref, ref } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.requests.selectedIds);

async function acceptRequests() {
  try {
    const selectedUsers = settings.value.requests.list.filter((user) =>
      selectedIds.value.has(user.userId)
    );

    const userKeys = await internals.api.post<{
      sessionKey: string;
      encryptedSymmetricKey: string;
      encryptersPublicKey: string;
    }>('/api/users/keys', {
      groupId: page.value.react.groupId,
    });

    await Promise.all(
      selectedUsers.map((user) => {
        const reencryptedSymmetricKey = reencryptSymmetricKey(
          sodium.from_base64(userKeys.data.sessionKey),
          sodium.from_base64(userKeys.data.encryptedSymmetricKey),
          sodium.from_base64(userKeys.data.encryptersPublicKey),
          sodium.from_base64(user.publicKey!)
        );

        return internals.api.post('/api/groups/access-requests/accept', {
          groupId: page.value.react.groupId,
          userId: user.userId,
          encryptedSymmetricKey: sodium.to_base64(reencryptedSymmetricKey),
        });
      })
    );

    for (const user of selectedUsers) {
      settings.value.members.list.push(user);
    }

    settings.value.requests.list = settings.value.requests.list.filter(
      (user) => !selectedIds.value.has(user.userId)
    );
    selectedIds.value.clear();

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
