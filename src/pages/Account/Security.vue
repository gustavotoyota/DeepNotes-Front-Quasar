<template>
  <template v-if="mounted">
    <h5 style="margin-block-start: 0; margin-block-end: 0">Change password</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-form ref="passwordChangeForm">
      <q-input
        label="Old password"
        type="password"
        v-model="data.oldPassword"
        style="width: 300px"
        filled
        dense
      />

      <Gap style="height: 20px" />

      <q-input
        label="New password"
        type="password"
        v-model="data.newPassword"
        style="width: 300px"
        filled
        dense
      />

      <Gap style="height: 20px" />

      <q-input
        label="Confirm new password"
        type="password"
        v-model="data.confirmNewPassword"
        style="width: 300px"
        filled
        dense
      />

      <Gap style="height: 20px" />

      <q-btn
        label="Change password"
        type="submit"
        color="primary"
        style="width: 300px"
        @click.prevent="changePassword()"
      />
    </q-form>

    <Gap style="height: 48px" />

    <h5 style="margin-block-start: 0; margin-block-end: 0">
      Two-factor authentication
    </h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-btn
      label="Enable two-factor authentication"
      color="primary"
      style="width: 300px"
    />

    <Gap style="height: 48px" />

    <h5 style="margin-block-start: 0; margin-block-end: 0">Sessions</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <template
      v-for="(device, index) in data.devices"
      :key="device.id"
    >
      <Gap
        v-if="index > 0"
        style="height: 18px"
      />

      <div
        style="
          border: 1px solid #606060;
          max-width: 450px;
          padding: 14px;
          border-radius: 6px;

          display: flex;
        "
        class="bg-grey-9"
      >
        <div>
          <div>
            {{ device.ipAddress }}
            <span v-if="device.current">(Current)</span>
          </div>
          <div>{{ device.browser }} on {{ device.os }}</div>
        </div>

        <q-space />

        <q-btn
          v-if="!device.current"
          label="Revoke"
          color="negative"
        />
      </div>
    </template>
  </template>

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import { from_base64 } from 'libsodium-wrappers';
import { Cookies, QForm, useQuasar } from 'quasar';
import { useAPI } from 'src/boot/external/axios';
import {
  computeDerivedKeys,
  encryptSymmetric,
  processSessionPrivateKey,
} from 'src/code/crypto/crypto';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { useMainStore } from 'src/stores/main';
import { onMounted, reactive, Ref, ref } from 'vue';

const mainStore = useMainStore();
const $q = useQuasar();
const api = useAPI();

const mounted = ref(false);

const passwordChangeForm = ref() as Ref<QForm>;

interface IDevice {
  id: string;

  ipAddress: string;
  browser: string;
  os: string;

  current: boolean;
}

const data = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',

  devices: [] as IDevice[],
});

onMounted(async () => {
  await mainStore.ready;

  const response = await api.post<{
    devices: IDevice[];
  }>('/api/users/account/security/load');

  data.devices = response.data.devices;

  mounted.value = true;
});

async function changePassword() {
  if (data.newPassword !== data.confirmNewPassword) {
    $q.notify({
      color: 'negative',
      message: 'New passwords do not match',
    });
    return;
  }

  try {
    const email = Cookies.get('email')!;

    // Compute derived keys

    const oldDerivedKeys = await computeDerivedKeys(email, data.oldPassword);
    const newDerivedKeys = await computeDerivedKeys(email, data.newPassword);

    // Reencrypt derived keys

    const response = await api.post<{
      encryptedPrivateKey: string;
      sessionKey: string;
    }>('/api/users/account/security/change-password', {
      oldPasswordHash: oldDerivedKeys.passwordHash,
      newPasswordHash: newDerivedKeys.passwordHash,
    });

    // Process session private key

    const decryptedPrivateKey = processSessionPrivateKey(
      from_base64(response.data.encryptedPrivateKey),
      oldDerivedKeys.masterKey,
      from_base64(response.data.sessionKey)
    );

    // Reencrypt private key with master key

    const reencryptedPrivateKey = encryptSymmetric(
      decryptedPrivateKey,
      newDerivedKeys.masterKey
    );

    // Request password change

    await api.post('/api/users/account/security/change-password', {
      oldPasswordHash: oldDerivedKeys.passwordHash,
      newPasswordHash: newDerivedKeys.passwordHash,
      reencryptedPrivateKey,
    });

    $q.notify({
      color: 'positive',
      message: 'Password changed successfully',
    });

    passwordChangeForm.value.reset();
  } catch (err: any) {
    $q.notify({
      color: 'negative',
      message: err.response?.data.error ?? 'An error has occurred',
    });
  }
}
</script>
