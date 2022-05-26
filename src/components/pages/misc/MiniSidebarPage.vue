<template>
  <q-item
    clickable
    :active="pathPage.id === $pages.react.pageId"
    active-class="bg-grey-9 text-grey-1"
    v-ripple
  >
    <q-item-section avatar>
      <q-icon name="mdi-note" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{
        $pages.realtime.get('pageName', pathPage.id)
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
      {{ $pages.realtime.get('pageName', pathPage.id) }}
    </q-tooltip>
  </q-item>
</template>

<script
  setup
  lang="ts"
>
import { IPageRef } from 'src/code/pages/app/app';
import { useUI } from 'src/stores/pages/ui';
import { computed } from 'vue';

const props = defineProps<{
  pathPage: IPageRef;
}>();

const ui = useUI();

const groupName = computed(() => {
  let result = '';

  if (props.pathPage.groupId) {
    result = $pages.realtime.get('groupName', props.pathPage.groupId) ?? '';
  }

  if (!result && props.pathPage.ownerId) {
    result = $pages.realtime.get('userName', props.pathPage.ownerId) ?? '';

    if (result) {
      result += "'s group";
    }
  }

  return result;
});
</script>
