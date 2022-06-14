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
      <q-item-label>{{ $pages.react.pageTitles[pageId] }}</q-item-label>
      <q-item-label caption>{{ groupName }}</q-item-label>
    </q-item-section>

    <q-tooltip
      v-if="ui.leftSidebarMini"
      anchor="center right"
      self="center left"
      max-width="200px"
      transition-show="jump-right"
      transition-hide="jump-left"
    >
      <div style="font-weight: bold; font-size: 14px">
        {{ $pages.react.pageTitles[pageId] }}
      </div>
      <div style="font-size: 12px">{{ groupName }}</div>
    </q-tooltip>
  </q-item>
</template>

<script
  setup
  lang="ts"
>
import { DICT_PAGE_GROUP_ID } from 'src/code/pages/app/app';
import { REALTIME_GROUP_NAME } from 'src/code/pages/app/realtime';
import { useUI } from 'src/stores/pages/ui';
import { computed } from 'vue';

const props = defineProps<{
  pageId: string;
}>();

const ui = useUI();

const groupName = computed(() =>
  $pages.realtime.get(
    REALTIME_GROUP_NAME,
    $pages.react.dict[`${DICT_PAGE_GROUP_ID}:${props.pageId}`]
  )
);
</script>
