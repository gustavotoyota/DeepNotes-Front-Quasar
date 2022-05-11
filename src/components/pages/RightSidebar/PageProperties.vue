<template>
  <q-list v-if="ui.rightSidebarMini">
    <q-item
      clickable
      :active="page.camera.react.lockPos"
      @click="negateProp(page.camera.react, 'lockPos')"
    >
      <q-item-section avatar>
        <q-icon name="mdi-axis-arrow-lock" />
      </q-item-section>
    </q-item>

    <q-item
      clickable
      :active="page.camera.react.lockZoom"
      @click="negateProp(page.camera.react, 'lockZoom')"
    >
      <q-item-section avatar>
        <q-icon name="mdi-arrow-vertical-lock" />
      </q-item-section>
    </q-item>
  </q-list>

  <div v-else>
    <!-- Page name -->

    <div style="padding: 20px">
      <q-input
        label="Page name"
        v-model="page.react.name"
        dense
        filled
      />
    </div>

    <q-separator />

    <!-- Lock position and zoom -->

    <div style="padding: 20px; display: flex">
      <q-checkbox
        label="Lock position"
        v-model="page.camera.react.lockPos"
        style="flex: 1; margin-left: -10px; margin-top: -10px"
      />

      <Gap style="width: 16px" />

      <q-checkbox
        label="Body"
        v-model="page.camera.react.lockZoom"
        style="flex: 1; margin-left: -10px; margin-top: -10px"
      />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { negateProp } from 'src/code/pages/static/utils';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { inject, Ref } from 'vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;
</script>
