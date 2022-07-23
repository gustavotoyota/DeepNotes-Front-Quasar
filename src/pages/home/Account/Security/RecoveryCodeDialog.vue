<template>
  <q-dialog
    v-model="visible"
    :maximized="maximized"
  >
    <q-card
      :style="{
        width: maximized ? undefined : '400px',
      }"
    >
      <q-form style="display: flex; flex-direction: column; height: 100%">
        <q-card-section style="padding: 12px">
          <div class="text-h6">Save your Recovery Code</div>
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

          <Gap style="height: 16px" />

          <div>Make sure to store it in a safe and accessible place.</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Finish"
            color="positive"
            v-close-popup
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
declare module 'src/code/app/internals' {
  export interface DeepNotesInternals {
    showRecoveryCodeDialog: (recoveryCode: string) => void;
  }
}
</script>

<script
  setup
  lang="ts"
>
import { internals } from 'src/code/app/internals';
import { setClipboardText } from 'src/code/lib/clipboard';
import { BREAKPOINT_MD_MIN } from 'src/code/lib/responsive';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/ui';
import { computed, ref } from 'vue';

const ui = useUI();

const maximized = computed(() => ui.width < BREAKPOINT_MD_MIN);

const visible = ref(false);

const recoveryCode = ref('');

internals.showRecoveryCodeDialog = (_recoveryCode: string) => {
  recoveryCode.value = _recoveryCode;

  visible.value = true;
};
</script>
