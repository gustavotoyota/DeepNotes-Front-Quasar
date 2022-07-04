<template>
  <q-drawer
    :mini="ui.rightSidebarMini"
    show-if-above
    side="right"
    bordered
    no-swipe-open
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
    style="display: flex; flex-direction: column"
  >
    <q-toolbar style="flex: none">
      <q-avatar
        icon="mdi-chart-box"
        size="50px"
        style="margin-left: -9px"
      />

      <q-toolbar-title
        v-if="!ui.rightSidebarMini"
        style="margin-left: 6px"
      >
        Properties
      </q-toolbar-title>
    </q-toolbar>

    <div style="flex: 1; overflow-y: auto; background-color: rgb(33, 33, 33)">
      <template v-if="page.activeElem.react.elem != null">
        <NoteProperties v-if="page.activeElem.react.type === ElemType.NOTE" />
        <ArrowProperties v-if="page.activeElem.react.type === ElemType.ARROW" />
      </template>

      <PageProperties v-else />
    </div>
  </q-drawer>
</template>

<script
  setup
  lang="ts"
>
import { computed } from '@vue/reactivity';
import { ElemType } from 'src/code/pages/app/page/elems/elem';
import { useUI } from 'src/stores/pages/ui';
import { provide } from 'vue';

import ArrowProperties from './ArrowProperties.vue';
import NoteProperties from './NoteProperties/NoteProperties.vue';
import PageProperties from './PageProperties/PageProperties.vue';

const ui = useUI();

const page = computed(() => $pages.react.page);

provide('page', page);
</script>
