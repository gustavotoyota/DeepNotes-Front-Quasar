<template>
  <q-page style="min-height: initial">
    <ResponsiveContainer style="margin: 150px auto">
      <q-form style="margin: 0px auto; max-width: 250px">
        <q-input
          label="E-mail"
          filled
          label-color="grey-5"
          v-model="data.email"
        />

        <Gap style="height: 12px" />

        <q-input
          label="Password"
          type="password"
          filled
          label-color="grey-5"
          v-model="data.password"
        />

        <Gap style="height: 20px" />

        <q-btn
          label="Login"
          type="submit"
          color="primary"
          style="width: 100%; font-size: 16px; padding: 12px 0px"
          @click.prevent="login()"
        />
      </q-form>
    </ResponsiveContainer>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { storeTokens } from 'src/code/auth';
import {
  computeDerivedKeys,
  reencryptSessionPrivateKey,
} from 'src/code/crypto/crypto';
import { bytesToBase64 } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import { useAuth } from 'src/stores/auth';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuth();
const router = useRouter();

const data = reactive({
  email: '',
  password: '',
});

async function login() {
  const derivedKeys = await computeDerivedKeys(data.email, data.password);

  try {
    const response = await $api.post<{
      accessToken: string;
      refreshToken: string;

      encryptedPrivateKey: string;

      sessionKey: string;
    }>('/auth/login', {
      email: data.email,
      passwordHash: bytesToBase64(derivedKeys.passwordHash),
    });

    // Store tokens

    storeTokens(response.data.accessToken, response.data.refreshToken);

    // Process session private key

    reencryptSessionPrivateKey(
      sodium.from_base64(response.data.encryptedPrivateKey),
      derivedKeys.masterKey,
      sodium.from_base64(response.data.sessionKey)
    );

    auth.loggedIn = true;

    Notify.create({
      message: 'Login successful.',
      color: 'positive',
    });

    await router.push('/pages');
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
