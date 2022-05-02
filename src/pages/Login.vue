<template>
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
import { useQuasar } from 'quasar';
import { computeKeys } from 'src/codes/crypto/crypto';
import { getIndexedDB } from 'src/codes/indexed-db';
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
  const keys = await computeKeys(data.email, data.password);

  try {
    const response = await api.post('/auth/login', {
      email: data.email,
      passwordHash: keys.passwordHash,
    });

    $q.cookies.set('access-token', response.data.accessToken);
    $q.cookies.set('refresh-token', response.data.refreshToken);

    $q.notify({
      color: 'positive',
      message: 'Login successful',
    });

    const indexedDB = await getIndexedDB();

    indexedDB.put('crypto', keys.masterKey, 'masterKey');
    indexedDB.put('crypto', keys.privateKey, 'privateKey');

    auth.loggedIn = true;

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
