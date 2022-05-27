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
      <q-item-label>{{
        $pages.realtime.get('pageTitle', pageId)
      }}</q-item-label>
      <q-item-label caption>{{ groupName }}</q-item-label>
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
      {{ $pages.realtime.get('pageTitle', pageId) }} - {{ groupName }}
    </q-tooltip>
  </q-item>
</template>

<script
  setup
  lang="ts"
>
import { useUI } from 'src/stores/pages/ui';
import { computed } from 'vue';

const props = defineProps<{
  pageId: string;
}>();

const ui = useUI();

const groupName = computed(() => $pages.computeGroupName(props.pageId));
</script>
