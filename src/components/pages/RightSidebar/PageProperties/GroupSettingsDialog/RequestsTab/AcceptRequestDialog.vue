<template>
  <q-btn
    label="Accept"
    color="positive"
    :disable="selectedIds.size === 0"
    @click="visible = true"
  />

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
          <q-btn
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
import { from_base64, to_base64 } from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { reencryptSymmetricKey } from 'src/code/crypto/crypto';
import { AppPage } from 'src/code/pages/app/page/page';
import { computed, inject, Ref, ref } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.requests.selectedIds);

async function acceptRequests() {
  const selectedUsers = settings.value.requests.list.filter((user) =>
    selectedIds.value.has(user.userId)
  );

  try {
    await $api.post('/api/groups/access-requests/accept', {
      groupId: page.value.groupId,
      users: selectedUsers.map((user) => {
        const reencryptedSymmetricKey = reencryptSymmetricKey(
          settings.value.sessionKey,
          settings.value.encryptedSymmetricKey,
          settings.value.encryptersPublicKey,
          from_base64(user.publicKey!)
        );

        return {
          userId: user.userId,
          encryptedSymmetricKey: to_base64(reencryptedSymmetricKey),
        };
      }),
    });

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
      color: 'negative',
      message: err.response?.data.message ?? 'An error has occurred',
    });
  }
}
</script>
