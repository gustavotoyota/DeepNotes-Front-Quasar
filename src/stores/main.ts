import { defineStore } from 'pinia';
import { reactive, toRefs, watch } from 'vue';

export const useMainStore = defineStore('main', () => {
  const state = reactive({
    mounted: false,
  });

  let resolvePromise: (value: unknown) => void;

  watch(
    () => state.mounted,
    () => {
      if (state.mounted) {
        resolvePromise(state.mounted);
      }
    },
    { immediate: true }
  );

  return {
    ...toRefs(state),

    ready: new Promise((resolve) => {
      resolvePromise = resolve;
    }),
  };
});
