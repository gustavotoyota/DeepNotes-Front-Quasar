<template>
  <q-page-container>
    <q-page style="display: flex; justify-content: center; align-items: center">
      <q-form
        style="
          width: 250px;
          padding: 24px;
          background-color: #303030;
          border-radius: 5px;
          display: flex;
          flex-direction: column;
        "
      >
        <q-input
          label="E-mail"
          filled
          dense
          label-color="grey-5"
          v-model="data.email"
        />

        <Gap style="height: 12px" />

        <q-input
          label="Password"
          type="password"
          filled
          dense
          label-color="grey-5"
          v-model="data.password"
        />

        <Gap style="height: 20px" />

        <q-btn
          label="Login"
          type="submit"
          color="primary"
          @click.prevent="onSubmit()"
        />
      </q-form>
    </q-page>
  </q-page-container>
</template>

<script lang="ts">
export default {
  preFetch({ store, redirect }: PreFetchOptions<any>) {
    if (useAuth(store).loggedIn) {
      redirect('/');
    }
  },
};
</script>

<script
  setup
  lang="ts"
>
import { PreFetchOptions } from '@quasar/app-vite';
import { AxiosInstance } from 'axios';
import { from_base64 } from 'libsodium-wrappers';
import { useQuasar } from 'quasar';
import { storeAuthValues } from 'src/codes/auth';
import {
  computeDerivedKeys,
  decryptXChachaPoly1305,
  reencryptSecretKeys,
  storeCryptoValues,
} from 'src/codes/crypto/crypto';
import { masterKey } from 'src/codes/crypto/master-key';
import { privateKey } from 'src/codes/crypto/private-key';
import { useAuth } from 'src/stores/auth';
import { getCurrentInstance, reactive } from 'vue';
import { useRouter } from 'vue-router';

import Gap from '../components/misc/Gap.vue';

const api = getCurrentInstance()!.appContext.config.globalProperties
  .$api as AxiosInstance;

const $q = useQuasar();

const auth = useAuth();

const router = useRouter();

const data = reactive({
  email: '',
  password: '',
});

async function onSubmit() {
  const derivedKeys = await computeDerivedKeys(data.email, data.password);

  try {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;

      encryptedPrivateKey: string;

      sessionKey: string;
    }>('/auth/login', {
      email: data.email,
      passwordHash: derivedKeys.passwordHash,
    });

    // Set API authorization header

    api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;

    // Store tokens

    storeAuthValues(response.data.accessToken, response.data.refreshToken);

    // Decrypt private key

    const decryptedPrivateKey = decryptXChachaPoly1305(
      response.data.encryptedPrivateKey,
      derivedKeys.masterKeyHash
    );

    // Encrypt keys with session key

    const { sessionEncryptedMasterKey, sessionEncryptedPrivateKey } =
      reencryptSecretKeys(
        derivedKeys.masterKeyHash,
        decryptedPrivateKey,
        from_base64(response.data.sessionKey)
      );

    // Store encrypted keys

    storeCryptoValues(sessionEncryptedMasterKey, sessionEncryptedPrivateKey);

    // Store e-mail

    localStorage.setItem('email', data.email);

    // Store keys on memory

    masterKey.set(derivedKeys.masterKeyHash);
    privateKey.set(decryptedPrivateKey);

    auth.loggedIn = true;

    $q.notify({
      color: 'positive',
      message: 'Login successful',
    });

    router.push('/');
  } catch (err: any) {
    $q.notify({
      color: 'negative',
      message: err.response?.data.message ?? 'An error has occurred',
    });
    return;
  }
}
</script>
