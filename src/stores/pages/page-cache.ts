import { defineStore } from 'pinia';
import { AppPage } from 'src/code/pages/app/page/page';
import {
  computed,
  reactive,
  ShallowReactive,
  shallowReactive,
  toRefs,
  watch,
} from 'vue';

import { usePages } from './pages';

export const usePageCache = defineStore('page-cache', () => {
  const state = reactive({
    cache: [] as ShallowReactive<AppPage[]>,
  });

  function addPage(page: AppPage) {
    const pages = usePages();

    if (state.cache.find((item) => item.id === page.id)) {
      return;
    }

    if (pages.pageId == null) {
      pages.pageId = page.id;
    }

    state.cache.push(shallowReactive(page));
  }

  const totalSize = computed(() => {
    return state.cache.reduce((acc, item) => {
      return acc + item.react.size;
    }, 0);
  });

  watch(totalSize, () => {
    while (state.cache.length > 0 && totalSize.value > 512 * 1024) {
      state.cache.shift();
    }
  });

  return {
    ...toRefs(state),

    addPage,

    totalSize,
  };
});
