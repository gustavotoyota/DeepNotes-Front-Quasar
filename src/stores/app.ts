import { defineStore } from 'pinia';
import { Resolvable } from 'src/code/lib/utils';
import { reactive, toRefs } from 'vue';

export const useApp = defineStore('app', () => {
  const state = reactive({
    loading: true,
  });

  return {
    ...toRefs(state),

    ready: new Resolvable(),
  };
});
