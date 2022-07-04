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
import { Notify } from 'quasar';
import { computeDerivedKeys, generateRandomKeys } from 'src/code/crypto/crypto';
import { wrapSymmetricKey } from 'src/code/crypto/symmetric-key';
import { ISerialObjectInput } from 'src/code/pages/app/serialization';
import { encodeText } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import { useAuth } from 'src/stores/auth';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const data = reactive({
  email: '',
  displayName: '',
  password: '',
  repeatPassword: '',
});

async function register() {
  // Password validation

  if (data.password !== data.repeatPassword) {
    Notify.create({
      message: 'Passwords do not match.',
      color: 'negative',
    });

    return;
  }

  const derivedKeys = await computeDerivedKeys(data.email, data.password);
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

  try {
    await $api.post('/auth/register', {
      email: data.email,

      displayName: data.displayName,

      passwordHash: derivedKeys.passwordHash,

      publicKey: to_base64(randomKeys.publicKey),
      encryptedPrivateKey: to_base64(randomKeys.encryptedPrivateKey),
      encryptedUserSymmetricKey: to_base64(
        randomKeys.encryptedUserSymmetricKey
      ),
      encryptedGroupSymmetricKey: to_base64(
        randomKeys.encryptedGroupSymmetricKey
      ),

      encryptedDefaultNote: to_base64(encryptedDefaultNote),
      encryptedDefaultArrow: to_base64(encryptedDefaultArrow),

      encryptedGroupName: to_base64(
        groupSymmetricKey.encrypt(encodeText(`${data.displayName}'s Group`))
      ),

      encryptedMainPageTitle: to_base64(
        groupSymmetricKey.encrypt(encodeText('Main page'))
      ),
    });

    Notify.create({
      message: 'Account created successfully.',
      color: 'positive',
    });

    await router.push('/login');
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
