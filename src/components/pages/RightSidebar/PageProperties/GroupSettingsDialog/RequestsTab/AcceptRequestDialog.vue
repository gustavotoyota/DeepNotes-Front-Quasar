<template>
  <q-btn
    label="Accept"
    color="positive"
    :disable="selectedIds.size === 0"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Accept requests</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="padding: 21px">
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
import { roles } from 'src/code/pages/static/roles';
import { computed, inject, Ref, ref, watch } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const roleId = ref<string | null>(null);

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.requests.selectedIds);

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  roleId.value = null;
});

async function acceptRequests() {
  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role',
      color: 'negative',
    });

    return;
  }

  visible.value = false;

  const selectedUsers = settings.value.requests.list.filter((user) =>
    selectedIds.value.has(user.userId)
  );

  await $api.post('/api/groups/access-requests/accept', {
    groupId: page.value.groupId,
    users: selectedUsers.map((user) => {
      const reencryptedSymmetricKey = reencryptSymmetricKey(
        settings.value.sessionKey,
        settings.value.encryptedSymmetricKey,
        settings.value.distributorsPublicKey,
        from_base64(user.publicKey!)
      );

      return {
        userId: user.userId,
        roleId: roleId.value,
        encryptedSymmetricKey: to_base64(reencryptedSymmetricKey),
      };
    }),
  });

  for (const user of selectedUsers) {
    settings.value.members.list.push({
      userId: user.userId,
      roleId: roleId.value,
    });
  }

  settings.value.requests.list = settings.value.requests.list.filter(
    (user) => !selectedIds.value.has(user.userId)
  );
  selectedIds.value.clear();
}
</script>
