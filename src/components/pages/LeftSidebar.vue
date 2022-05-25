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
        v-for="pageId in $pages.react.pathPageIds"
        :key="pageId"
        :name="$pages.realtime.get('pageName', pageId)"
        :active="pageId === $pages.react.pageId"
        @click="$pages.navigateTo(pageId, $router)"
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
