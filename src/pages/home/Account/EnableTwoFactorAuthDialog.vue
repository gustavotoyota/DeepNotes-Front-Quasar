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
          <div class="text-h6">Two factor authentication</div>
        </q-card-section>

        <q-separator />

        <q-card-section
          style="flex: 1; padding: 21px; display: flex; flex-direction: column"
        >
          <div>1. Get an authenticator app:</div>

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

          <div>2. Scan the QR code below:</div>

          <Gap style="height: 8px" />

          <div><canvas ref="canvasElem"></canvas></div>

          <Gap style="height: 8px" />

          <div>Or enter the following code: {{ secret }}</div>

          <Gap style="height: 16px" />

          <div>3. Enter the 6-digit verification code below:</div>

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
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />

          <q-btn
            flat
            label="Continue"
            color="positive"
            @click.prevent="verify()"
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
import QRCode from 'qrcode';
import { Notify } from 'quasar';
import { BREAKPOINT_MD_MIN } from 'src/code/pages/static/responsive';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { computed, nextTick, ref } from 'vue';

const ui = useUI();

const maximized = computed(() => ui.width < BREAKPOINT_MD_MIN);

const visible = ref(false);

const keyUri = ref('');

const canvasElem = ref<HTMLElement>();

const secret = ref('');
const authenticatorToken = ref('');

async function showDialog(params: { secret: string; keyUri: string }) {
  visible.value = true;

  secret.value = params.secret;
  keyUri.value = params.keyUri;

  await nextTick();

  await QRCode.toCanvas(canvasElem.value, keyUri.value, {
    width: 175,
  });
}

async function verify() {
  try {
    const response = await $api.post<{
      recoveryCode: string;
    }>('/api/users/account/security/two-factor-auth/verify', {
      authenticatorToken: authenticatorToken.value,
    });

    Notify.create({
      message: 'Two factor authentication successfully enabled.',
      color: 'positive',
    });
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
