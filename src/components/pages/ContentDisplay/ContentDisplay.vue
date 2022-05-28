<template>
  <div
    class="display"
    @wheel="onWheel"
    @pointerdown.middle.prevent="onMiddlePointerDown"
  >
    <template
      v-if="
        page.react.loaded &&
        page.react.hasPermission &&
        page.react.userStatus !== 'invite'
      "
    >
      <DisplayBackground />
      <DisplayNotes />
      <DisplayBoxSelection />
      <DisplayBtns />
    </template>

    <LoadingOverlay v-if="!page.react.loaded" />

    <div
      v-if="!page.react.hasPermission || page.react.userStatus === 'invite'"
      style="
        position: absolute;

        left: 0;
        top: 0;
        right: 0;
        bottom: 0;

        background-color: #181818;

        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div style="text-align: center">
        <template v-if="page.react.userStatus !== 'invite'">
          <div>You do not have permission to access this page.</div>

          <Gap style="height: 12px" />

          <RequestAccessDialog v-if="page.react.userStatus == null" />

          <q-btn
            v-if="page.react.userStatus === 'request'"
            label="Cancel request"
            color="negative"
            @click="cancelRequest()"
          />
        </template>

        <template v-if="page.react.userStatus === 'invite'">
          <div div>You were invited to access this group.</div>

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

        <div
          v-if="page.react.userStatus === 'rejected'"
          style="color: red"
        >
          Your access request has been rejected.
        </div>
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { provide } from 'vue';

import DisplayBackground from './DisplayBackground.vue';
import DisplayBoxSelection from './DisplayBoxSelection.vue';
import DisplayBtns from './DisplayBtns.vue';
import DisplayNotes from './DisplayNotes.vue';
import RequestAccessDialog from './RequestAccessDialog.vue';

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);

function onWheel(event: WheelEvent) {
  props.page.zooming.perform(event);
}

function onMiddlePointerDown(event: PointerEvent) {
  props.page.panning.start(event);
}

async function cancelRequest() {
  await $api.post('/api/groups/access-request/cancel', {
    groupId: props.page.groupId,
  });

  // eslint-disable-next-line vue/no-mutating-props
  props.page.react.userStatus = null;
}

async function acceptInvitation() {
  await $api.post('/api/groups/access-invitation/accept', {
    groupId: props.page.groupId,
  });

  // eslint-disable-next-line vue/no-mutating-props
  props.page.react.userStatus = 'member';
}
async function rejectInvitation() {
  await $api.post('/api/groups/access-invitation/reject', {
    groupId: props.page.groupId,
  });

  // eslint-disable-next-line vue/no-mutating-props
  props.page.react.userStatus = null;
}
</script>

<style scoped>
.display {
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  overflow: hidden;
}

.display :deep(a[target='_blank']) {
  text-decoration: none !important;

  color: #64b5f6;
}
</style>
