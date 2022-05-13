import { defineStore } from 'pinia';
import { reactive, toRefs, watch } from 'vue';

export const useApp = defineStore('app', () => {
  const state = reactive({
    mounted: false,
  });

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

    ready,
  };
});
