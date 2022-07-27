<template>
  <div
    class="display-page"
    @wheel="onWheel"
    @pointerdown.left.capture="onLeftPointerDown"
    @pointerdown.middle.prevent="onMiddlePointerDown"
    @auxclick.capture.middle="onMiddleAuxClick"
  >
    <LoadingOverlay v-if="page.react.loading" />

    <template v-if="page.react.status === 'error'">
      {{ page.react.errorMessage }}
    </template>

    <template v-else-if="page.react.status === 'password'">
      <div>This group is password protected.</div>

      <Gap style="height: 16px" />

      <q-form style="display: flex; flex-direction: column; width: 240px">
        <q-input
          label="Password"
          type="password"
          filled
          v-model="password"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Enter"
          type="submit"
          color="primary"
          style="font-size: 16px"
          @click.prevent="onEnterPassword()"
        />
      </q-form>
    </template>

    <template v-else-if="page.react.status === 'unauthorized'">
      <template v-if="page.react.groupUserStatus === 'invite'">
        <div>
          You were invited to access this group ({{ page.react.groupName }}).
        </div>

        <Gap style="height: 12px" />

        <SmartBtn
          label="Accept invitation"
          color="positive"
          @click="acceptInvitation()"
        />

        <Gap style="height: 16px" />

        <SmartBtn
          label="Reject invitation"
          color="negative"
          @click="rejectInvitation()"
        />
      </template>

      <template v-else>
        <div>You do not have permission to access this page.</div>

        <template v-if="auth.loggedIn">
          <Gap style="height: 12px" />

          <RequestAccessDialog v-if="page.react.groupUserStatus == null">
            <template #default="{ showDialog }">
              <SmartBtn
                label="Request access"
                color="primary"
                @click="showDialog()"
              />
            </template>
          </RequestAccessDialog>

          <SmartBtn
            v-if="page.react.groupUserStatus === 'request'"
            label="Cancel request"
            color="negative"
            @click="cancelRequest()"
          />

          <div
            v-if="page.react.groupUserStatus === 'rejected'"
            style="color: red"
          >
            Your access request has been rejected.
          </div>
        </template>
      </template>
    </template>

    <DisplayContent v-else-if="page.react.status === 'success'" />
  </div>
</template>

<script
  setup
  lang="ts"
>
/* eslint-disable vue/no-mutating-props */

import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { internals } from 'src/code/app/internals';
import { AppPage } from 'src/code/app/pages/page/page';
import { DICT_GROUP_SYMMETRIC_KEY } from 'src/code/app/pages/pages';
import { decryptSymmetric } from 'src/code/lib/crypto/crypto';
import { wrapSymmetricKey } from 'src/code/lib/crypto/symmetric-key';
import { isMouseOverScrollbar } from 'src/code/lib/dom';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useAuth } from 'src/stores/auth';
import { onMounted, provide, ref } from 'vue';

import DisplayContent from './DisplayContent.vue';
import RequestAccessDialog from './RequestAccessDialog.vue';

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);

const auth = useAuth();

const password = ref('');

onMounted(() => {
  // eslint-disable-next-line vue/no-mutating-props
  props.page.originElem = document.querySelector('.display-page')!;
});

function onWheel(event: WheelEvent) {
  props.page.zooming.perform(event);
}

function onLeftPointerDown(event: PointerEvent) {
  if (isMouseOverScrollbar(event)) {
    return;
  }

  props.page.pinching.addPointer(event);

  if (props.page.pinching.react.active) {
    event.stopPropagation();
  }
}

function onMiddlePointerDown(event: PointerEvent) {
  props.page.panning.start(event);
}

function onMiddleAuxClick(event: MouseEvent) {
  if (props.page.panning.react.active) {
    event.preventDefault();
  }
}

async function cancelRequest() {
  try {
    await internals.api.post('/api/groups/access-requests/cancel', {
      groupIds: [props.page.react.groupId],
    });

    props.page.react.groupUserStatus = null;
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}

async function acceptInvitation() {
  try {
    await internals.api.post('/api/groups/access-invitations/accept', {
      groupId: props.page.react.groupId,
    });

    await props.page.setup();
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}
async function rejectInvitation() {
  try {
    await internals.api.post('/api/groups/access-invitations/reject', {
      groupId: props.page.react.groupId,
    });

    props.page.react.groupUserStatus = null;
    props.page.react.groupSymmetricKey = null as any;
  } catch (error: any) {
    Notify.create({
      message: error.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(error);
  }
}

async function onEnterPassword() {
  try {
    const groupPasswordHash = sodium.crypto_pwhash(
      32,
      password.value,
      new Uint8Array(sodium.crypto_pwhash_SALTBYTES),
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    const decryptedGroupSymmetricKey = decryptSymmetric(
      props.page.encryptedGroupSymmetricKey,
      groupPasswordHash
    );

    const wrappedGroupSymmetricKey = wrapSymmetricKey(
      decryptedGroupSymmetricKey
    );

    $pages.react.dict[
      `${DICT_GROUP_SYMMETRIC_KEY}:${props.page.react.groupId}`
    ] = wrappedGroupSymmetricKey;

    for (const page of $pages.pageCache.react.cache) {
      if (page.react.groupId === props.page.react.groupId) {
        await page.finishSetup();
      }
    }
  } catch (error) {
    Notify.create({
      message: 'Incorrect password.',
      type: 'negative',
    });

    console.error(error);
  }
}
</script>

<style
  lang="scss"
  scoped
>
.display-page {
  position: absolute;

  inset: 0;

  overflow: hidden;

  background-color: #181818;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  isolation: isolate;

  :deep(a) {
    text-decoration: none;

    color: unset;
  }

  :deep(*) {
    touch-action: none;
  }
}
</style>
