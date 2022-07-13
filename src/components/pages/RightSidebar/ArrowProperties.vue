<template>
  <q-list v-if="!ui.rightSidebarExpanded">
    <MiniSidebarBtn
      tooltip="Backward"
      icon="mdi-arrow-left-thick"
      :active="arrow.react.collab.backward"
      @click="
        changeProp(!arrow.react.collab.backward, (arrow, value) => {
          arrow.react.collab.backward = value;
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Forward"
      icon="mdi-arrow-right-thick"
      :active="arrow.react.collab.forward"
      @click="
        changeProp(!arrow.react.collab.forward, (arrow, value) => {
          arrow.react.collab.forward = value;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Dashed"
      icon="mdi-border-none"
      :active="arrow.react.collab.dashed"
      @click="
        changeProp(!arrow.react.collab.dashed, (arrow, value) => {
          arrow.react.collab.dashed = value;
        })
      "
    />
  </q-list>

  <div v-else>
    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Backward"
        :model-value="arrow.react.collab.backward"
        @click="
          changeProp(!arrow.react.collab.backward, (arrow, value) => {
            arrow.react.collab.backward = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Forward"
        :model-value="arrow.react.collab.forward"
        @click="
          changeProp(!arrow.react.collab.forward, (arrow, value) => {
            arrow.react.collab.forward = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Dashed"
        :model-value="arrow.react.collab.dashed"
        @click="
          changeProp(!arrow.react.collab.dashed, (arrow, value) => {
            arrow.react.collab.dashed = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px">
      <q-color
        :disable="page.react.readonly"
        :model-value="arrow.react.collab.color"
        @update:model-value="
          changeProp($event, (arrow, value) => {
            arrow.react.collab.color = value;
          })
        "
        default-view="palette"
        no-header
        no-header-tabs
        no-footer
        :palette="[
          '#9E9E9E', // grey
          '#607D8B', // blue-grey
          '#795548', // brown
          '#FF5722', // deep-orange
          '#FF9800', // orange
          '#FFC107', // amber
          '#FFEB3B', // yellow
          '#CDDC39', // lime
          '#8BC34A', // light-green
          '#4CAF50', // green
          '#009688', // teal
          '#00BCD4', // cyan
          '#03A9F4', // light-blue
          '#2196F3', // blue
          '#3F51B5', // indigo
          '#673AB7', // deep-purple
          '#9C27B0', // purple
          '#E91E63', // pink
          '#F44336', // red
        ]"
      />
    </div>

    <q-separator />

    <!-- Default -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <q-btn
        label="Set as default"
        color="primary"
        @click="setAsDefault()"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { PageArrow } from 'src/code/pages/app/page/arrows/arrow';
import { AppPage } from 'src/code/pages/app/page/page';
import {
  ISerialArrow,
  ISerialArrowInput,
} from 'src/code/pages/app/serialization';
import { encodeText } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { computed } from 'vue';
import { inject, Ref } from 'vue';
import { yXmlFragmentToProsemirrorJSON } from 'y-prosemirror';

import Checkbox from '../misc/Checkbox.vue';
import MiniSidebarBtn from '../misc/MiniSidebarBtn.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const arrow = computed(() => page.value.activeElem.react.elem as PageArrow);

function changeProp(value: any, func: (arrow: PageArrow, value: any) => void) {
  page.value.collab.doc.transact(() => {
    for (const arrow of page.value.selection.react.validArrows) {
      func(arrow, value);
    }
  });
}

async function setAsDefault() {
  if (!($pages.react.page.activeElem.react.elem instanceof PageArrow)) {
    return;
  }

  $pages.react.defaultArrow = ISerialArrow.parse({
    ...arrow.value.react.collab,

    label: yXmlFragmentToProsemirrorJSON(arrow.value.react.collab.label),
  } as ISerialArrowInput);

  try {
    await $api.post<{
      templateId: string;
    }>('/api/users/save-default-arrow', {
      encryptedDefaultArrow: sodium.to_base64(
        $pages.react.symmetricKey.encrypt(
          encodeText(JSON.stringify($pages.react.defaultArrow))
        )
      ),
    });

    Notify.create({
      message: 'Default arrow set.',
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
