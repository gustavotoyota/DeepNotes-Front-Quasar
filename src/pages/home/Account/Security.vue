<template>
  <template v-if="mounted">
    <h5 style="margin-block-start: 0; margin-block-end: 0">Change password</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-form
      ref="passwordChangeForm"
      style="display: flex; flex-direction: column"
    >
      <q-input
        label="Old password"
        type="password"
        v-model="data.oldPassword"
        style="max-width: 300px"
        filled
        dense
      />

      <Gap style="height: 20px" />

      <q-input
        label="New password"
        type="password"
        v-model="data.newPassword"
        style="max-width: 300px"
        filled
        dense
      />

      <Gap style="height: 20px" />

      <q-input
        label="Confirm new password"
        type="password"
        v-model="data.confirmNewPassword"
        style="max-width: 300px"
        filled
        dense
      />

      <Gap style="height: 20px" />

      <q-btn
        label="Change password"
        type="submit"
        color="primary"
        style="max-width: 300px"
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
      style="max-width: 300px"
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
import sodium from 'libsodium-wrappers';
import { Notify, QForm, useMeta } from 'quasar';
import {
  computeDerivedKeys,
  encryptSymmetric,
  reencryptSessionPrivateKey,
} from 'src/code/crypto/crypto';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { useApp } from 'src/stores/app';
import { onMounted, reactive, Ref, ref } from 'vue';

const app = useApp();

useMeta(() => ({
  title: 'Security - Account - DeepNotes',
}));

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
  email: '',

  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',

  devices: [] as IDevice[],
});

onMounted(async () => {
  await app.ready;

  const response = await $api.post<{
    email: string;

    devices: IDevice[];
  }>('/api/users/account/security/load');

  data.email = response.data.email;
  data.devices = response.data.devices;

  mounted.value = true;
});

async function changePassword() {
  if (data.newPassword !== data.confirmNewPassword) {
    Notify.create({
      message: 'New passwords do not match.',
      color: 'negative',
    });

    return;
  }

  try {
    // Compute derived keys

    const oldDerivedKeys = await computeDerivedKeys(
      data.email,
      data.oldPassword
    );
    const newDerivedKeys = await computeDerivedKeys(
      data.email,
      data.newPassword
    );

    // Reencrypt derived keys

    const response = await $api.post<{
      encryptedPrivateKey: string;
      sessionKey: string;
    }>('/api/users/account/security/change-password', {
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
      newPasswordHash: sodium.to_base64(newDerivedKeys.passwordHash),
    });

    // Process session private key

    const decryptedPrivateKey = reencryptSessionPrivateKey(
      sodium.from_base64(response.data.encryptedPrivateKey),
      oldDerivedKeys.masterKey,
      sodium.from_base64(response.data.sessionKey)
    );

    // Reencrypt private key with master key

    const reencryptedPrivateKey = encryptSymmetric(
      decryptedPrivateKey,
      newDerivedKeys.masterKey
    );

    // Request password change

    await $api.post('/api/users/account/security/change-password', {
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
      newPasswordHash: sodium.to_base64(newDerivedKeys.passwordHash),
      reencryptedPrivateKey: sodium.to_base64(reencryptedPrivateKey),
    });

    Notify.create({
      message: 'Password changed successfully.',
      color: 'positive',
    });

    passwordChangeForm.value.reset();
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
