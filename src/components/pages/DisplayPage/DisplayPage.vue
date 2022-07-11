<template>
  <div
    class="display-page"
    @wheel="onWheel"
    @pointerdown.left.capture="onLeftPointerDown"
    @pointerdown.middle.prevent="onMiddlePointerDown"
  >
    <LoadingOverlay v-if="page.react.loading" />

    <template v-if="page.react.status === 'error'">
      {{ page.react.errorMessage }}
    </template>

    <template v-if="page.react.status === 'unauthorized'">
      <template v-if="page.react.userStatus === 'invite'">
        <div>
          You were invited to access this group ({{ page.react.groupName }}).
        </div>

        <Gap style="height: 12px" />

        <q-btn
          label="Accept invitation"
          color="positive"
          @click="acceptInvitation()"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Reject invitation"
          color="negative"
          @click="rejectInvitation()"
        />
      </template>

      <template v-else>
        <div>You do not have permission to access this page.</div>

        <Gap style="height: 12px" />

        <RequestAccessDialog v-if="page.react.userStatus == null" />

        <q-btn
          v-if="page.react.userStatus === 'request'"
          label="Cancel request"
          color="negative"
          @click="cancelRequest()"
        />

        <div
          v-if="page.react.userStatus === 'rejected'"
          style="color: red"
        >
          Your access request has been rejected.
        </div>
      </template>
    </template>

    <DisplayContent v-if="page.react.status === 'success'" />
  </div>
</template>

<script
  setup
  lang="ts"
>
/* eslint-disable vue/no-mutating-props */

import { Notify } from 'quasar';
import { AppPage } from 'src/code/pages/app/page/page';
import { isMouseOverScrollbar } from 'src/code/pages/static/dom';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { onMounted, provide } from 'vue';

import DisplayContent from './DisplayContent.vue';
import RequestAccessDialog from './RequestAccessDialog.vue';

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);

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

async function cancelRequest() {
  try {
    await $api.post('/api/groups/access-requests/cancel', {
      groupIds: [props.page.react.groupId],
    });

    // eslint-disable-next-line vue/no-mutating-props
    props.page.react.userStatus = undefined;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}

async function acceptInvitation() {
  try {
    await $api.post('/api/groups/access-invitations/accept', {
      groupId: props.page.react.groupId,
    });

    await props.page.setup();
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
async function rejectInvitation() {
  try {
    await $api.post('/api/groups/access-invitations/reject', {
      groupId: props.page.react.groupId,
    });

    props.page.react.userStatus = undefined;
    props.page.react.symmetricKey = null as any;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
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
