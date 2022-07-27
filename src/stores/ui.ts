import { defineStore } from 'pinia';
import { BREAKPOINT_LG_MIN } from 'src/code/lib/responsive';
import { negateProp } from 'src/code/lib/utils';

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

      if (this.leftSidebarExpanded && window.innerWidth < BREAKPOINT_LG_MIN) {
        this.rightSidebarExpanded = false;
      }
    },
    toggleRightSidebar() {
      negateProp(this, 'rightSidebarExpanded');

      if (this.rightSidebarExpanded && window.innerWidth < BREAKPOINT_LG_MIN) {
        this.leftSidebarExpanded = false;
      }
    },
  },
});
