<template>
  <q-page style="min-height: initial">
    <ResponsiveContainer style="margin: 100px auto">
      <q-form style="margin: 0px auto; max-width: 270px">
        <q-input
          label="E-mail"
          filled
          label-color="grey-5"
          v-model="email"
        />

        <Gap style="height: 12px" />

        <q-input
          label="Display name"
          filled
          label-color="grey-5"
          v-model="displayName"
        />

        <Gap style="height: 12px" />

        <PasswordField
          label="Password"
          v-model="password"
        />

        <Gap style="height: 12px" />

        <PasswordField
          label="Repeat password"
          v-model="repeatPassword"
        />

        <Gap style="height: 20px" />

        <SmartBtn
          label="Create account"
          type="submit"
          color="primary"
          style="width: 100%; font-size: 16px; padding: 12px 0px"
          @click.prevent="register()"
        />
      </q-form>

      <Gap style="height: 16px" />

      <div style="text-align: center">
        Already registered?
        <router-link to="/login">Log in</router-link>
      </div>
    </ResponsiveContainer>
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
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import {
  computeDerivedKeys,
  generateRandomKeys,
} from 'src/code/app/crypto/crypto';
import { wrapSymmetricKey } from 'src/code/app/crypto/symmetric-key';
import { internals } from 'src/code/app/internals';
import { ISerialObjectInput } from 'src/code/app/pages/serialization';
import { encodeText } from 'src/code/lib/text';
import Gap from 'src/components/misc/Gap.vue';
import PasswordField from 'src/components/misc/PasswordField.vue';
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useAuth } from 'src/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const displayName = ref('');
const password = ref('');
const repeatPassword = ref('');

async function register() {
  // Password validation

  if (password.value !== repeatPassword.value) {
    Notify.create({
      message: 'Passwords do not match.',
      type: 'negative',
    });

    return;
  }

  try {
    const derivedKeys = await computeDerivedKeys(email.value, password.value);
    const randomKeys = await generateRandomKeys(derivedKeys.masterKey);

    const userSymmetricKey = wrapSymmetricKey(randomKeys.userSymmetricKey);

    const encryptedDefaultNote = userSymmetricKey.encrypt(
      encodeText(
        JSON.stringify({
          layers: [
            {
              noteIndexes: [0],
            },
            {},
          ],
          notes: [{ layerIndexes: [1] }],
        } as ISerialObjectInput)
      )
    );
    const encryptedDefaultArrow = userSymmetricKey.encrypt(
      encodeText(JSON.stringify({}))
    );

    const groupSymmetricKey = wrapSymmetricKey(randomKeys.groupSymmetricKey);

    await internals.api.post('/auth/register', {
      email: email,

      displayName: displayName,

      passwordHash: sodium.to_base64(derivedKeys.passwordHash),

      publicKey: sodium.to_base64(randomKeys.publicKey),
      encryptedPrivateKey: sodium.to_base64(randomKeys.encryptedPrivateKey),
      encryptedUserSymmetricKey: sodium.to_base64(
        randomKeys.encryptedUserSymmetricKey
      ),
      encryptedGroupSymmetricKey: sodium.to_base64(
        randomKeys.encryptedGroupSymmetricKey
      ),

      encryptedDefaultNote: sodium.to_base64(encryptedDefaultNote),
      encryptedDefaultArrow: sodium.to_base64(encryptedDefaultArrow),

      encryptedGroupName: sodium.to_base64(
        groupSymmetricKey.encrypt(encodeText(`${displayName.value}'s Group`))
      ),

      encryptedMainPageTitle: sodium.to_base64(
        groupSymmetricKey.encrypt(encodeText('Main page'))
      ),
    });

    await router.push({
      name: 'finish-registration',
      params: {
        email: email.value,
      },
    });
  } catch (error: any) {
    Notify.create({
      message: error.response?.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}
</script>
