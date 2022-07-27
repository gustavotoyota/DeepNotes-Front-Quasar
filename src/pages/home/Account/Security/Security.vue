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

      <SmartBtn
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

    <ManageTwoFactorAuthDialog v-if="internals.react.twoFactorAuthEnabled">
      <template #default="{ showDialog }">
        <q-btn
          label="Manage two-factor authentication"
          color="primary"
          style="max-width: 300px"
          @click="showDialog(email)"
        />
      </template>
    </ManageTwoFactorAuthDialog>

    <EnableTwoFactorAuthDialog v-else>
      <template #default="{ showDialog }">
        <q-btn
          label="Enable two-factor authentication"
          color="primary"
          style="max-width: 300px"
          @click="showDialog(email)"
        />
      </template>
    </EnableTwoFactorAuthDialog>

    <Gap style="height: 48px" />

    <h5 style="margin-block-start: 0; margin-block-end: 0">Sessions</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-btn
      label="Invalidate other sessions"
      color="primary"
      style="max-width: 300px"
    />
  </template>

  <LoadingOverlay v-else />

  <RecoveryCodeDialog />
</template>

<script lang="ts">
declare module 'src/code/app/internals' {
  export interface DeepNotesInternalsReact {
    twoFactorAuthEnabled: boolean;
  }
}
</script>

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
} from 'src/code/app/crypto/crypto';
import { internals } from 'src/code/app/internals';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import PasswordField from 'src/components/misc/PasswordField.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useApp } from 'src/stores/app';
import { onMounted, Ref, ref } from 'vue';

import EnableTwoFactorAuthDialog from './EnableTwoFactorAuthDialog.vue';
import ManageTwoFactorAuthDialog from './ManageTwoFactorAuthDialog.vue';
import RecoveryCodeDialog from './RecoveryCodeDialog.vue';

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

internals.react.twoFactorAuthEnabled = false;

onMounted(async () => {
  await app.ready;

  const response = await internals.api.post<{
    email: string;
    authenticatorEnabled: boolean;
  }>('/api/users/account/security/load');

  email.value = response.data.email;
  internals.react.twoFactorAuthEnabled = response.data.authenticatorEnabled;

  mounted.value = true;
});

async function changePassword() {
  if (newPassword.value === oldPassword.value) {
    Notify.create({
      message: 'New password must be different than old password.',
      color: 'negative',
    });

    return;
  }

  if (newPassword.value !== confirmNewPassword.value) {
    Notify.create({
      message: 'New passwords do not match.',
      type: 'negative',
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

    const response = await internals.api.post<{
      encryptedPrivateKey: string;
      sessionKey: string;
    }>('/api/users/account/security/change-password', {
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
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

    await internals.api.post('/api/users/account/security/change-password', {
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
      newPasswordHash: sodium.to_base64(newDerivedKeys.passwordHash),
      reencryptedPrivateKey: sodium.to_base64(reencryptedPrivateKey),
    });

    Notify.create({
      message: 'Password changed successfully.',
      type: 'positive',
    });

    // Clear form data

    oldPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}
</script>
