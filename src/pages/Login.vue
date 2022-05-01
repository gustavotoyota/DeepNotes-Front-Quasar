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

<script
  setup
  lang="ts"
>
import { AxiosInstance } from 'axios';
import { useQuasar } from 'quasar';
import { getCurrentInstance, reactive } from 'vue';

import Gap from '../components/misc/Gap.vue';

const api = getCurrentInstance()!.appContext.config.globalProperties
  .$api as AxiosInstance;

const $q = useQuasar();

const data = reactive({
  email: '',
  password: '',
});

async function onSubmit() {
  // Master key

  const masterKey = await argon2.hash({
    pass: data.password,
    salt: data.email,
    type: argon2.ArgonType.Argon2id,
  });

  // Password hash

  const passwordHash = await argon2.hash({
    pass: masterKey.hash,
    salt: data.password,
    type: argon2.ArgonType.Argon2id,
  });

  try {
    const response = await api.post('/auth/register', {
      email: data.email,
      passwordHash: passwordHash.encoded,
    });

    $q.cookies.set('access-token', response.data.accessToken);
    $q.cookies.set('refresh-token', response.data.refreshToken);
  } catch {
    $q.notify({
      color: 'negative',
      message: 'An error has occurred',
    });
    return;
  }
}
</script>
