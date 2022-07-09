import { defineStore } from 'pinia';
import { negateProp } from 'src/code/utils';

export const useUI = defineStore('ui', {
  state: () => ({
    leftSidebarExpanded: false,
    rightSidebarExpanded: false,

    leftSidebarVisible: true,
    rightSidebarVisible: true,

    width: 0,
  }),

  getters: {},

  actions: {
    toggleLeftSidebar() {
      negateProp(this, 'leftSidebarExpanded');

      if (this.leftSidebarExpanded && window.innerWidth < 992) {
        this.rightSidebarExpanded = false;
      }
    },
    toggleRightSidebar() {
      negateProp(this, 'rightSidebarExpanded');

      if (this.rightSidebarExpanded && window.innerWidth < 992) {
        this.leftSidebarExpanded = false;
      }
    },
  },
});
