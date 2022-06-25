<template>
  <q-list v-if="ui.rightSidebarMini">
    <MiniSidebarBtn
      tooltip="Backward"
      icon="mdi-arrow-left-thick"
      :active="arrow.collab.backward"
      @click="
        changeProp(!arrow.collab.backward, (arrow, value) => {
          arrow.collab.backward = value;
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Forward"
      icon="mdi-arrow-right-thick"
      :active="arrow.collab.forward"
      @click="
        changeProp(!arrow.collab.forward, (arrow, value) => {
          arrow.collab.forward = value;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Dashed"
      icon="mdi-border-none"
      :active="arrow.collab.dashed"
      @click="
        changeProp(!arrow.collab.dashed, (arrow, value) => {
          arrow.collab.dashed = value;
        })
      "
    />
  </q-list>

  <div v-else>
    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Backward"
        :model-value="arrow.collab.backward"
        @click="
          changeProp(!arrow.collab.backward, (arrow, value) => {
            arrow.collab.backward = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Forward"
        :model-value="arrow.collab.forward"
        @click="
          changeProp(!arrow.collab.forward, (arrow, value) => {
            arrow.collab.forward = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Dashed"
        :model-value="arrow.collab.dashed"
        @click="
          changeProp(!arrow.collab.dashed, (arrow, value) => {
            arrow.collab.dashed = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px">
      <q-color
        :disable="page.react.readonly"
        :model-value="arrow.collab.color"
        @update:model-value="
          changeProp($event, (arrow, value) => {
            arrow.collab.color = value;
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
import { to_base64 } from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { PageArrow } from 'src/code/pages/app/page/arrows/arrow';
import { AppPage } from 'src/code/pages/app/page/page';
import { ISerialArrow } from 'src/code/pages/app/serialization';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { inject, Ref, toRef } from 'vue';

import Checkbox from '../misc/Checkbox.vue';
import MiniSidebarBtn from '../misc/MiniSidebarBtn.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const arrow = toRef(page.value.activeElem.react, 'elem') as Ref<PageArrow>;

function changeProp(value: any, func: (arrow: PageArrow, value: any) => void) {
  page.value.collab.doc.transact(() => {
    for (const arrow of page.value.selection.react.arrows) {
      func(arrow, value);
    }
  });
}

async function setAsDefault() {
  if (!($pages.react.page.activeElem.react.elem instanceof PageArrow)) {
    return;
  }

  $pages.react.defaultArrow = ISerialArrow.parse(
    $pages.serialization.serializeArrow(
      $pages.react.page.activeElem.react.elem.collab
    )
  );

  try {
    await $api.post<{
      templateId: string;
    }>('/api/users/save-default-arrow', {
      encryptedDefaultArrow: to_base64(
        $pages.react.symmetricKey.encrypt(
          new TextEncoder().encode(JSON.stringify($pages.react.defaultArrow))
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
