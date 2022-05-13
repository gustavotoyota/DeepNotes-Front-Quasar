import { defineStore } from 'pinia';
import { AppPage, IPageReference } from 'src/code/pages/app/page/page';
import { computed, reactive, toRefs, watch } from 'vue';

import { usePageCache } from './page-cache';

export const usePages = defineStore('pages', () => {
  // State

  const state = reactive({
    mounted: false,

    pageId: null as string | null,

    pathPages: [] as IPageReference[],
    recentPages: [] as IPageReference[],
  });

  // Getters

  const page = computed(() => {
    const pageCache = usePageCache();

    return pageCache.cache.find((page) => {
      return page.id === state.pageId;
    }) as AppPage;
  });

  // Actions

  async function fetchData() {
    //
  }

  // Others

  const ready = new Promise((resolve) => {
    const unwatch = watch(
      () => state.mounted,
      () => {
        if (state.mounted) {
          unwatch();
          resolve(state.mounted);
        }
      },
      { immediate: true }
    );
  });

  return {
    ...toRefs(state),

    page,

    fetchData,

    ready,
  };
});

export type Pages = ReturnType<typeof usePages>;
