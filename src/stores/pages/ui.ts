import { defineStore } from 'pinia';
import { negateProp } from 'src/code/pages/static/utils';

export const useUI = defineStore('ui', {
  state: () => ({
    leftSidebarMini: true,
    rightSidebarMini: true,
  }),

  getters: {},

  actions: {
    toggleLeftSidebar() {
      negateProp(this, 'leftSidebarMini');
    },
    toggleRightSidebar() {
      negateProp(this, 'rightSidebarMini');
    },
  },
});