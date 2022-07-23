<template>
  <q-page style="min-height: initial">
    <ResponsiveContainer style="margin: 150px auto">
      <div style="margin: 0px auto; max-width: 270px">
        <q-form>
          <template v-if="authType === 'standard'">
            <q-input
              label="E-mail"
              filled
              label-color="grey-5"
              v-model="email"
            />

            <Gap style="height: 12px" />

            <PasswordField
              label="Password"
              v-model="password"
            />

            <Gap style="height: 16px" />

            <Checkbox
              label="Remember e-mail"
              v-model="rememberEmail"
            />

            <Gap style="height: 16px" />

            <SmartBtn
              label="Login"
              type="submit"
              color="primary"
              style="width: 100%; font-size: 16px; padding: 12px 0px"
              @click.prevent="onSubmit()"
            />

            <Gap style="height: 16px" />

            <div style="text-align: center">
              Not registered yet?
              <router-link to="/register"> Sign up </router-link>
            </div>
          </template>

          <template v-if="authType === 'authenticator'">
            <div style="font-size: 22px; text-align: center; font-weight: bold">
              Two-factor Authentication
            </div>

            <Gap style="height: 16px" />

            <q-input
              label="6-digit code"
              filled
              label-color="grey-5"
              :maxlength="6"
              v-model="authenticatorToken"
            />

            <Gap style="height: 16px" />

            <Checkbox
              label="Remember this device"
              v-model="rememberDevice"
            />

            <Gap style="height: 16px" />

            <div style="display: flex">
              <SmartBtn
                label="Cancel"
                color="grey-9"
                style="flex: 1; font-size: 16px; padding: 8px 0px"
                @click="authType = 'standard'"
              />

              <Gap style="width: 16px" />

              <SmartBtn
                label="Verify"
                type="submit"
                color="primary"
                style="flex: 1; font-size: 16px; padding: 8px 0px"
                @click.prevent="onSubmit()"
              />
            </div>

            <Gap style="height: 16px" />

            <div style="text-align: center">
              Lost your phone?
              <a
                style="pointer: cursor"
                @click="
                  () => {
                    recoveryCode = '';
                    authType = 'recovery';
                  }
                "
                >Use your recovery code</a
              >
            </div>
          </template>

          <template v-if="authType === 'recovery'">
            <div style="font-size: 22px; text-align: center; font-weight: bold">
              Two-factor Authentication
            </div>

            <Gap style="height: 16px" />

            <q-input
              label="Recovery code"
              filled
              label-color="grey-5"
              v-model="recoveryCode"
            />

            <Gap style="height: 16px" />

            <div style="display: flex">
              <SmartBtn
                label="Cancel"
                color="grey-9"
                style="flex: 1; font-size: 16px; padding: 8px 0px"
                @click="authType = 'authenticator'"
              />

              <Gap style="width: 16px" />

              <SmartBtn
                label="Verify"
                type="submit"
                color="primary"
                style="flex: 1; font-size: 16px; padding: 8px 0px"
                @click.prevent="onSubmit()"
              />
            </div>
          </template>
        </q-form>
      </div>
    </ResponsiveContainer>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { storeTokenData } from 'src/code/app/auth';
import {
  computeDerivedKeys,
  reencryptSessionPrivateKey,
} from 'src/code/app/crypto/crypto';
import { internals } from 'src/code/app/internals';
import Checkbox from 'src/components/misc/Checkbox.vue';
import Gap from 'src/components/misc/Gap.vue';
import PasswordField from 'src/components/misc/PasswordField.vue';
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useAuth } from 'src/stores/auth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const authType = ref('standard');

const email = ref('');
const password = ref('');

const rememberEmail = ref(false);

const authenticatorToken = ref('');
const rememberDevice = ref(false);

const recoveryCode = ref('');

onMounted(() => {
  email.value = localStorage.getItem('email') ?? '';

  rememberEmail.value = email.value !== '';
});

async function onSubmit() {
  try {
    // Store e-mail

    if (rememberEmail.value) {
      localStorage.setItem('email', email.value);
    } else {
      localStorage.removeItem('email');
    }

    // Login

    const auth = useAuth();

    const derivedKeys = await computeDerivedKeys(email.value, password.value);

    const response = await internals.api.post<{
      authenticator: boolean;

      accessToken: string;

      encryptedPrivateKey: string;

      sessionKey: string;
    }>('/auth/login', {
      email: email.value,
      passwordHash: sodium.to_base64(derivedKeys.passwordHash),

      authenticatorToken:
        authType.value === 'authenticator'
          ? authenticatorToken.value
          : undefined,
      rememberDevice:
        authType.value === 'authenticator' ? rememberDevice.value : undefined,

      recoveryCode:
        authType.value === 'recovery' ? recoveryCode.value : undefined,
    });

    if (response.data.authenticator && authType.value === 'standard') {
      authenticatorToken.value = '';
      authType.value = 'authenticator';
      return;
    }

    // Store token data

    storeTokenData(response.data.accessToken);

    localStorage.setItem(
      'refresh-token-expiration',
      (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
    );

    // Process session private key

    reencryptSessionPrivateKey(
      sodium.from_base64(response.data.encryptedPrivateKey),
      derivedKeys.masterKey,
      sodium.from_base64(response.data.sessionKey)
    );

    auth.loggedIn = true;

    Notify.create({
      message: 'Logged in successfully.',
      type: 'positive',
    });

    await router.push('/pages');
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
}
</script>
