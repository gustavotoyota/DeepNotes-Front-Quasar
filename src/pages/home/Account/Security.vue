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
      <PasswordField
        label="Old password"
        v-model="oldPassword"
        dense
        style="max-width: 300px"
      />

      <Gap style="height: 20px" />

      <PasswordField
        label="New password"
        v-model="newPassword"
        dense
        style="max-width: 300px"
      />

      <Gap style="height: 20px" />

      <PasswordField
        label="Confirm new password"
        v-model="confirmNewPassword"
        dense
        style="max-width: 300px"
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

    <EnableTwoFactorAuthDialog>
      <template #default="{ showDialog }">
        <q-btn
          label="Enable two-factor authentication"
          color="primary"
          style="max-width: 300px"
          @click="
            async () => {
              Dialog.create({
                title: 'Enable two-factor authentication',
                message: 'Enter your password:',
                prompt: {
                  type: 'password',
                  model: '',
                },
                style: {
                  maxWidth: '350px',
                },
                cancel: true,
              }).onOk(async (password: string) => {
                const data = await enableTwoFactorAuth(password);

                // @ts-ignore
                if (data == null) {
                  return;
                }

                // @ts-ignore
                await showDialog(data);
              });
            }
          "
        />
      </template>
    </EnableTwoFactorAuthDialog>

    <Gap style="height: 48px" />

    <h5 style="margin-block-start: 0; margin-block-end: 0">Sessions</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-btn
      label="Sign out of other sessions"
      color="primary"
      style="max-width: 300px"
    />
  </template>

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import sodium from 'libsodium-wrappers';
import { Dialog, Notify, QForm, useMeta } from 'quasar';
import {
  computeDerivedKeys,
  encryptSymmetric,
  reencryptSessionPrivateKey,
} from 'src/code/crypto/crypto';
import { bytesToBase64 } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import PasswordField from 'src/components/pages/misc/PasswordField.vue';
import { useApp } from 'src/stores/app';
import { onMounted, Ref, ref } from 'vue';

import EnableTwoFactorAuthDialog from './EnableTwoFactorAuthDialog.vue';

const app = useApp();

useMeta(() => ({
  title: 'Security - Account - DeepNotes',
}));

const mounted = ref(false);

const passwordChangeForm = ref() as Ref<QForm>;

const email = ref('');

const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const authenticatorEnabled = ref(false);

onMounted(async () => {
  await app.ready;

  const response = await $api.post<{
    email: string;
    authenticatorEnabled: boolean;
  }>('/api/users/account/security/load');

  email.value = response.data.email;
  authenticatorEnabled.value = response.data.authenticatorEnabled;

  mounted.value = true;
});

async function enableTwoFactorAuth(password: string) {
  try {
    const passwordHash = (await computeDerivedKeys(email.value, password))
      .passwordHash;

    const response = await $api.post<{
      secret: string;
      keyUri: string;
    }>('/api/users/account/security/two-factor-auth/enable', {
      passwordHash: bytesToBase64(passwordHash),
    });

    return {
      secret: response.data.secret,
      keyUri: response.data.keyUri,
    };
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}

async function changePassword() {
  if (newPassword.value !== confirmNewPassword.value) {
    Notify.create({
      message: 'New passwords do not match.',
      color: 'negative',
    });

    return;
  }

  try {
    // Compute derived keys

    const oldDerivedKeys = await computeDerivedKeys(
      email.value,
      oldPassword.value
    );
    const newDerivedKeys = await computeDerivedKeys(
      email.value,
      newPassword.value
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

    // Clear form data

    oldPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
