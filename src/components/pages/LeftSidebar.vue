<template>
  <q-drawer
    show-if-above
    :mini="ui.leftSidebarMini"
    side="left"
    bordered
    no-swipe-Mini
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
  >
    <q-toolbar style="width: 299px">
      <q-avatar
        icon="mdi-animation"
        size="50px"
        style="margin-left: -9px"
      />

      <q-toolbar-title style="margin-left: 6px">Path</q-toolbar-title>
    </q-toolbar>

    <q-list
      :class="{
        mini: ui.leftSidebarMini,
      }"
    >
      <MiniSidebarPage
        v-for="pageRef in $pages.react.pathPages"
        :key="pageRef.id"
        :name="$pages.realtime.values[`pageName.${pageRef.id}`]"
        :active="pageRef.id === $pages.react.pageId"
        @click="$pages.navigateTo(pageRef.id, $router)"
      />
    </q-list>
  </q-drawer>
</template>

<script
  setup
  lang="ts"
>
import { useUI } from 'src/stores/pages/ui';

import MiniSidebarPage from './misc/MiniSidebarPage.vue';

const ui = useUI();
</script>
