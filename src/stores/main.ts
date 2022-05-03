import { defineStore } from 'pinia';
import { reactive, toRefs, watch } from 'vue';

export const useMainStore = defineStore('main', () => {
  const state = reactive({
    mounted: false,
  });

  watch(
    () => state.mounted,
    () => {
      console.log(state.mounted);
    },
    { immediate: true }
  );

  return {
    ...toRefs(state),
  };
});
