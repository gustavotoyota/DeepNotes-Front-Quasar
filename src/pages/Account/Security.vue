<template>
  <template v-if="mounted">
    <h5 style="margin-block-start: 0; margin-block-end: 0">Change password</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-input
      label="Old password"
      type="password"
      v-model="data.oldPassword"
      style="width: 300px"
      filled
      dense
    />

    <Gap style="height: 24px" />

    <q-input
      label="New password"
      type="password"
      v-model="data.newPassword"
      style="width: 300px"
      filled
      dense
    />

    <Gap style="height: 24px" />

    <q-input
      label="Confirm new password"
      type="password"
      v-model="data.confirmNewPassword"
      style="width: 300px"
      filled
      dense
    />

    <Gap style="height: 24px" />

    <q-btn
      label="Change password"
      color="primary"
      style="width: 300px"
      @click="changePassword()"
    />

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

    <h5 style="margin-block-start: 0; margin-block-end: 0">Devices</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <div
      v-for="device in data.devices"
      :key="device.id"
      style="border: 1px solid #606060; padding: 16px; border-radius: 6px"
      class="bg-grey-9"
    >
      <div>{{ device.ipAddress }}</div>
      <div>{{ device.browser }} on {{ device.os }}</div>
    </div>
  </template>

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import { from_base64 } from 'libsodium-wrappers';
import { useQuasar } from 'quasar';
import { useAPI } from 'src/boot/external/axios';
import {
  computeDerivedKeys,
  decryptXChachaPoly1305,
  reencryptSecretKeys,
} from 'src/codes/crypto/crypto';
import { masterKey } from 'src/codes/crypto/master-key';
import { privateKey } from 'src/codes/crypto/private-key';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { onMounted, reactive, ref } from 'vue';

const $q = useQuasar();
const api = useAPI();

const mounted = ref(false);

interface IDevice {
  id: string;

  ipAddress: string;
  browser: string;
  os: string;
}

const data = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',

  devices: [] as IDevice[],
});

onMounted(async () => {
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
    // Compute derived keys

    const oldDerivedKeys = await computeDerivedKeys(
      localStorage.getItem('email')!,
      data.oldPassword
    );
    const newDerivedKeys = await computeDerivedKeys(
      localStorage.getItem('email')!,
      data.newPassword
    );

    // Reencrypt derived keys

    const response = await api.post<{
      encryptedPrivateKey: string;
      sessionKey: string;
    }>('/api/users/account/security/change-password', {
      oldPasswordHash: oldDerivedKeys.passwordHash,
      newPasswordHash: newDerivedKeys.passwordHash,
    });

    // Decrypt private key

    const decryptedPrivateKey = decryptXChachaPoly1305(
      response.data.encryptedPrivateKey,
      oldDerivedKeys.masterKeyHash
    );

    // Encrypt keys with session key

    const { sessionEncryptedMasterKey, sessionEncryptedPrivateKey } =
      reencryptSecretKeys(
        newDerivedKeys.masterKeyHash,
        decryptedPrivateKey,
        from_base64(response.data.sessionKey)
      );

    // Store encrypted keys

    localStorage.setItem('encrypted-master-key', sessionEncryptedMasterKey);
    localStorage.setItem('encrypted-private-key', sessionEncryptedPrivateKey);

    // Store keys on memory

    masterKey.set(newDerivedKeys.masterKeyHash);
    privateKey.set(decryptedPrivateKey);

    // Request password change with reencrypted private key

    const reencryptedPrivateKey = masterKey.encrypt(decryptedPrivateKey);

    await api.post('/api/users/account/security/change-password', {
      oldPasswordHash: oldDerivedKeys.passwordHash,
      newPasswordHash: newDerivedKeys.passwordHash,
      reencryptedPrivateKey,
    });

    $q.notify({
      color: 'positive',
      message: 'Password changed',
    });
  } catch (err: any) {
    $q.notify({
      color: 'negative',
      message: err.response?.data.error ?? 'An error has occurred',
    });
  }
}
</script>
