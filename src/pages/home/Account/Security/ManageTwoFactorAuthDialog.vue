<template>
  <slot :show-dialog="showDialog"></slot>

  <q-dialog
    v-model="visible"
    :maximized="maximized"
  >
    <q-card
      style="display: flex; flex-direction: column; position: relative"
      :style="{ width: maximized ? undefined : '400px' }"
    >
      <q-card-section style="padding: 12px">
        <div class="text-h6">Two-factor authentication</div>
      </q-card-section>

      <q-separator />

      <div
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        "
      >
        <q-card-section
          style="padding: 21px; display: flex; flex-direction: column"
        >
          <div>Scan the following QR code to add another device:</div>

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

          <SmartBtn
            label="Untrust all devices"
            color="secondary"
            @click="untrustDevices()"
          />
        </q-card-section>

        <q-separator />

        <q-card-section
          style="flex: 1; padding: 21px; display: flex; flex-direction: column"
        >
          <div>
            If you lose your authenticator app, your recovery code will be the
            only way to regain access to your account:
          </div>

          <Gap style="height: 8px" />

          <q-input
            :model-value="recoveryCode"
            readonly
            filled
            dense
          >
            <template v-slot:append>
              <q-icon
                name="mdi-content-copy"
                class="cursor-pointer"
                @click="
                  () => {
                    setClipboardText(recoveryCode);

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

          <Gap style="height: 8px" />

          <div>Make sure to store it in a safe and accessible place.</div>
        </q-card-section>

        <q-separator />

        <q-card-section
          style="padding: 21px; display: flex; flex-direction: column"
        >
          <SmartBtn
            label="Disable two-factor authentication"
            color="negative"
            @click="disableTwoFactorAuth()"
          />
        </q-card-section>

        <LoadingOverlay v-if="loading" />
      </div>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
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

const canvasElem = ref<HTMLElement>();

const visible = ref(false);
const loading = ref(true);

const secret = ref('');
const recoveryCode = ref('');

let passwordHash: string;

async function showDialog(email: string) {
  Dialog.create({
    title: 'Manage two-factor authentication',
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

  // Use password to load two-factor authentication data

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
      recoveryCode: string;
    }>('/api/users/account/security/two-factor-auth/load', {
      passwordHash,
    });

    secret.value = response.data.secret;
    recoveryCode.value = response.data.recoveryCode;

    await QRCode.toCanvas(canvasElem.value, response.data.keyUri, {
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

async function untrustDevices() {
  try {
    await internals.api.post(
      '/api/users/account/security/two-factor-auth/untrust-devices',
      { passwordHash }
    );

    Notify.create({
      message: 'All devices have been untrusted.',
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

async function disableTwoFactorAuth() {
  try {
    await internals.api.post<void>(
      '/api/users/account/security/two-factor-auth/disable',
      { passwordHash }
    );

    internals.react.twoFactorAuthEnabled = false;

    Notify.create({
      message: 'Two-factor authentication has been disabled.',
      type: 'positive',
    });

    visible.value = false;
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}
</script>
