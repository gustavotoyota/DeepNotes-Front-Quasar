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
          @click.prevent="login()"
        />
      </q-form>
    </q-page>
  </q-page-container>
</template>

<script
  setup
  lang="ts"
>
import { useQuasar } from 'quasar';
import { useAPI } from 'src/boot/external/axios';
import { authRedirects, storeAuthValues } from 'src/code/auth';
import { computeDerivedKeys, processCryptoKeys } from 'src/code/crypto/crypto';
import { useAuth } from 'src/stores/auth';
import { reactive } from 'vue';

import Gap from '../components/misc/Gap.vue';

const api = useAPI();
const $q = useQuasar();
const auth = useAuth();

const data = reactive({
  email: '',
  password: '',
});

async function login() {
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

    // Process crypto keys

    processCryptoKeys(
      response.data.encryptedPrivateKey,
      derivedKeys.masterKeyHash,
      derivedKeys.masterKeyHash,
      response.data.sessionKey
    );

    // Store e-mail

    localStorage.setItem('email', data.email);

    auth.loggedIn = true;

    $q.notify({
      color: 'positive',
      message: 'Login successful',
    });

    location.replace(authRedirects.login);
  } catch (err: any) {
    $q.notify({
      color: 'negative',
      message: err.response?.data.error ?? 'An error has occurred',
    });
    return;
  }
}
</script>
