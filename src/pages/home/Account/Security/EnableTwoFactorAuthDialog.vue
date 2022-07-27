<template>
  <slot :show-dialog="showDialog"></slot>

  <q-dialog
    v-model="visible"
    :maximized="maximized"
  >
    <q-card
      :style="{
        width: maximized ? undefined : '500px',
      }"
    >
      <q-form style="display: flex; flex-direction: column; height: 100%">
        <q-card-section style="padding: 12px">
          <div class="text-h6">Two-factor authentication</div>
        </q-card-section>

        <q-separator />

        <q-card-section
          style="
            flex: 1;
            padding: 21px;
            display: flex;
            flex-direction: column;
            position: relative;
          "
        >
          <div style="color: #c0c0c0">1. Get an authenticator app:</div>

          <Gap style="height: 8px" />

          <div>
            Android devices:
            <a
              href="https://play.google.com/store/apps/details?id=com.beemdevelopment.aegis"
              target="_blank"
              >Aegis</a
            >,
            <a
              href="https://play.google.com/store/apps/details?id=com.authy.authy"
              target="_blank"
              >Authy</a
            >,
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              >Google Authenticator</a
            >.
          </div>
          <div>
            iOS devices:
            <a
              href="https://apps.apple.com/app/raivo-otp/id1459042137"
              target="_blank"
              >Raivo</a
            >,
            <a
              href="https://apps.apple.com/app/authy/id494168017"
              target="_blank"
              >Authy</a
            >,
            <a
              href="https://apps.apple.com/app/google-authenticator/id388497605"
              target="_blank"
              >Google Authenticator</a
            >.
          </div>

          <Gap style="height: 16px" />

          <div style="color: #c0c0c0">2. Scan the QR code below:</div>

          <Gap style="height: 8px" />

          <div>
            <canvas
              ref="canvasElem"
              width="175"
              height="175"
            ></canvas>
          </div>

          <Gap style="height: 8px" />

          <div>Or use the following code:</div>

          <Gap style="height: 8px" />

          <q-input
            :model-value="secret"
            readonly
            filled
            dense
            style="max-width: 250px"
          >
            <template v-slot:append>
              <q-icon
                name="mdi-content-copy"
                class="cursor-pointer"
                @click="
                  () => {
                    setClipboardText(secret);

                    Notify.create({
                      message: 'Copied to clipboard.',
                      type: 'positive',
                    });
                  }
                "
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  transition-show="jump-up"
                  transition-hide="jump-down"
                >
                  Copy
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>

          <Gap style="height: 16px" />

          <div style="color: #c0c0c0">
            3. Enter the 6-digit verification code below:
          </div>

          <Gap style="height: 8px" />

          <div>
            <q-input
              placeholder="6-digit code"
              filled
              style="max-width: 150px"
              :maxlength="6"
              v-model="authenticatorToken"
            />
          </div>

          <LoadingOverlay v-if="loading" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />

          <SmartBtn
            flat
            label="Continue"
            color="positive"
            @click.prevent="verify()"
            :disable="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script
  setup
  lang="ts"
>
import sodium from 'libsodium-wrappers';
import QRCode from 'qrcode';
import { Dialog, Notify } from 'quasar';
import { computeDerivedKeys } from 'src/code/app/crypto';
import { internals } from 'src/code/app/internals';
import { setClipboardText } from 'src/code/lib/clipboard';
import { Resolvable } from 'src/code/lib/resolvable';
import { BREAKPOINT_MD_MIN } from 'src/code/lib/responsive';
import { sleep } from 'src/code/lib/utils';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useUI } from 'src/stores/ui';
import { computed, ref } from 'vue';

const ui = useUI();

const maximized = computed(() => ui.width < BREAKPOINT_MD_MIN);

const visible = ref(false);
const loading = ref(true);

const keyUri = ref('');

const canvasElem = ref<HTMLElement>();

const secret = ref('');
const authenticatorToken = ref('');

let passwordHash: string;

async function showDialog(email: string) {
  Dialog.create({
    title: 'Enable two-factor authentication',
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

  // Use password to enable two-factor authentication

  const passwordPromise = new Resolvable<string>();
  const password = await passwordPromise;

  try {
    loading.value = true;
    visible.value = true;

    await sleep(500);

    passwordHash = sodium.to_base64(
      (await computeDerivedKeys(email, password)).passwordHash
    );

    const response = await internals.api.post<{
      secret: string;
      keyUri: string;
    }>('/api/users/account/security/two-factor-auth/enable', {
      passwordHash,
    });

    secret.value = response.data.secret;
    keyUri.value = response.data.keyUri;

    await QRCode.toCanvas(canvasElem.value, keyUri.value, {
      width: 175,
    });

    loading.value = false;
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);

    visible.value = false;

    void showDialog(email);
  }
}

async function verify() {
  try {
    const response = await internals.api.post<{
      recoveryCode: string;
    }>('/api/users/account/security/two-factor-auth/verify', {
      passwordHash,
      authenticatorToken: authenticatorToken.value,
    });

    internals.react.twoFactorAuthEnabled = true;

    visible.value = false;

    internals.showRecoveryCodeDialog(response.data.recoveryCode);

    Notify.create({
      message: 'Two-factor authentication enabled successfully.',
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
