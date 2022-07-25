<template>
  <template v-if="mounted">
    <h5 style="margin-block-start: 0; margin-block-end: 0">E-mail</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <q-form style="display: flex; flex-direction: column; max-width: 300px">
      <q-input
        label="Current e-mail"
        filled
        dense
        :model-value="currentEmail"
        readonly
      />

      <Gap style="height: 16px" />

      <q-input
        label="New e-mail"
        filled
        dense
        v-model="newEmail"
      />

      <Gap style="height: 16px" />

      <SmartBtn
        label="Change e-mail"
        color="primary"
        @click.prevent="changeEmail()"
      />
    </q-form>
  </template>

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import sodium from 'libsodium-wrappers';
import { Dialog, Notify, useMeta } from 'quasar';
import {
  computeDerivedKeys,
  encryptSymmetric,
  reencryptSessionPrivateKey,
} from 'src/code/app/crypto/crypto';
import { internals } from 'src/code/app/internals';
import { Resolvable } from 'src/code/lib/resolvable';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useApp } from 'src/stores/app';
import { onMounted, ref } from 'vue';
import { z } from 'zod';

const app = useApp();

useMeta(() => ({
  title: 'General - Account - DeepNotes',
}));

const currentEmail = ref('');
const newEmail = ref('');

const mounted = ref(false);

onMounted(async () => {
  await app.ready;

  const response = await internals.api.post<{
    email: string;
  }>('/api/users/account/general/load');

  currentEmail.value = response.data.email;
  newEmail.value = '';

  mounted.value = true;
});

async function changeEmail() {
  if (!z.string().email().safeParse(newEmail.value).success) {
    Notify.create({
      message: 'New e-mail address is invalid.',
      color: 'negative',
    });

    return;
  }

  // Show password prompt

  Dialog.create({
    title: 'Change e-mail',
    message: 'Enter your password:',
    color: 'primary',
    prompt: {
      type: 'password',
      model: '',
      filled: true,
    },
    style: {
      maxWidth: '350px',
    },
    cancel: true,
  })
    .onOk(async (password: string) => {
      passwordPromise.resolve(password);
    })
    .onCancel(() => {
      passwordPromise.reject();
    });

  // Send password hash to server

  const passwordPromise = new Resolvable<string>();
  const password = await passwordPromise;

  // Compute derived keys

  const oldDerivedKeys = await computeDerivedKeys(currentEmail.value, password);
  const newDerivedKeys = await computeDerivedKeys(newEmail.value, password);

  try {
    await internals.api.post('/api/users/account/general/change-email', {
      newEmail: newEmail.value,
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
    });

    Notify.create({
      message: 'A verification code has been sent to the new e-mail address.',
      color: 'positive',
    });

    Dialog.create({
      title: 'Verify the new e-mail',
      message: 'Enter the verification code sent to the new e-mail:',
      color: 'primary',
      prompt: {
        model: '',
        filled: true,
      },
      style: {
        maxWidth: '350px',
      },
      cancel: true,
    })
      .onOk((verificationCode: string) => {
        verificationCodePromise.resolve(verificationCode);
      })
      .onCancel(() => {
        verificationCodePromise.reject();
      });
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);

    return;
  }

  // Verification code promise

  const verificationCodePromise = new Resolvable<string>();
  const emailVerificationCode = await verificationCodePromise;

  try {
    const response = await internals.api.post<{
      encryptedPrivateKey: string;
      sessionKey: string;
    }>('/api/users/account/general/change-email', {
      newEmail: newEmail.value,
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
      emailVerificationCode,
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

    // Request e-mail change

    await internals.api.post('/api/users/account/general/change-email', {
      newEmail: newEmail.value,
      oldPasswordHash: sodium.to_base64(oldDerivedKeys.passwordHash),
      newPasswordHash: sodium.to_base64(newDerivedKeys.passwordHash),
      reencryptedPrivateKey: sodium.to_base64(reencryptedPrivateKey),
      emailVerificationCode,
    });

    if (localStorage.getItem('email') != null) {
      localStorage.setItem('email', newEmail.value);
    }

    currentEmail.value = newEmail.value;
    newEmail.value = '';

    Notify.create({
      message: 'E-mail changed successfully.',
      type: 'positive',
    });
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}
</script>
