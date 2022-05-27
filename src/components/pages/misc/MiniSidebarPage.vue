<template>
  <q-item
    clickable
    :active="pageId === $pages.react.pageId"
    active-class="bg-grey-9 text-grey-1"
    v-ripple
  >
    <q-item-section avatar>
      <q-icon name="mdi-note" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ $pages.realtime.get('pageName', pageId) }}</q-item-label>
      <q-item-label caption>{{
        $pages.realtime.get(
          'groupName',
          $pages.react.dict[`groupId.${pageId}`]
        ) ||
        ($pages.react.dict[`ownerId.${pageId}`]
          ? `${$pages.realtime.get(
              'userName',
              $pages.react.dict[`ownerId.${pageId}`]
            )}'s Group`
          : '') ||
        ''
      }}</q-item-label>
    </q-item-section>

    <q-tooltip
      v-if="ui.leftSidebarMini"
      anchor="center right"
      self="center left"
      :offset="[10, 10]"
      max-width="200px"
      transition-show="jump-right"
      transition-hide="jump-left"
    >
      {{ $pages.realtime.get('pageName', pageId) }}
    </q-tooltip>
  </q-item>
</template>

<script
  setup
  lang="ts"
>
import { useUI } from 'src/stores/pages/ui';

defineProps<{
  pageId: string;
}>();

const ui = useUI();
</script>
