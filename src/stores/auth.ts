import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export const useAuth = defineStore('auth', () => {
  const state = reactive({
    loggedIn: false,

    oldSessionKey: '',
    newSessionKey: '',
  });

  return {
    ...toRefs(state),
  };
});

export type Auth = ReturnType<typeof useAuth>;
