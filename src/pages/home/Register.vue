<template>
  <q-page-container>
    <q-page style="display: flex; justify-content: center; align-items: center">
      <q-form
        style="
          width: 270px;
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
          label="Display name"
          filled
          dense
          label-color="grey-5"
          v-model="data.displayName"
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

        <Gap style="height: 12px" />

        <q-input
          label="Repeat password"
          type="password"
          filled
          dense
          label-color="grey-5"
          v-model="data.repeatPassword"
        />

        <Gap style="height: 20px" />

        <q-btn
          label="Create account"
          type="submit"
          color="primary"
          @click.prevent="register()"
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
import { to_base64 } from 'libsodium-wrappers';
import { useQuasar } from 'quasar';
import { useAPI } from 'src/boot/external/axios';
import { computeDerivedKeys, generateRandomKeys } from 'src/code/crypto/crypto';
import Gap from 'src/components/misc/Gap.vue';
import { useAuth } from 'src/stores/auth';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const api = useAPI();

const data = reactive({
  email: '',
  displayName: '',
  password: '',
  repeatPassword: '',
});

async function register() {
  // Password validation

  if (data.password !== data.repeatPassword) {
    $q.notify({
      color: 'negative',
      message: 'Passwords do not match',
    });
    return;
  }

  const derivedKeys = await computeDerivedKeys(data.email, data.password);
  const randomKeys = await generateRandomKeys(derivedKeys.masterKey);

  try {
    await api.post('/auth/register', {
      email: data.email,

      displayName: data.displayName,

      passwordHash: derivedKeys.passwordHash,

      publicKey: to_base64(randomKeys.publicKey),
      encryptedPrivateKey: to_base64(randomKeys.encryptedPrivateKey),

      encryptedSymmetricKey: to_base64(randomKeys.encryptedSymmetricKey),
    });

    $q.notify({
      color: 'positive',
      message: 'Account created successfully!',
    });

    router.push('/login');
  } catch (err: any) {
    $q.notify({
      color: 'negative',
      message: err.response?.data.error ?? 'An error has occurred',
    });
    return;
  }
}
</script>