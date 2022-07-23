<template>
  <div class="display-btns">
    <DisplayBtn
      icon="mdi-magnify-remove-outline"
      @click="page.camera.resetZoom()"
    >
      <q-tooltip
        anchor="center left"
        self="center right"
        transition-show="jump-left"
        transition-hide="jump-right"
      >
        Reset zoom
      </q-tooltip>
    </DisplayBtn>

    <Gap style="height: 4px" />

    <DisplayBtn
      icon="mdi-image-filter-center-focus-weak"
      @click="page.camera.fitToScreen()"
    >
      <q-tooltip
        anchor="center left"
        self="center right"
        transition-show="jump-left"
        transition-hide="jump-right"
      >
        Fit to screen
      </q-tooltip>
    </DisplayBtn>
  </div>
</template>

<script
  setup
  lang="ts"
>
import DisplayBtn from 'src/components/misc/DisplayBtn.vue';
import Gap from 'src/components/misc/Gap.vue';
import { computed } from 'vue';

const page = computed(() => $pages.react.page);
</script>

<style
  lang="scss"
  scoped
>
.display-btns {
  position: absolute;

  right: 8px;
  top: 60px;

  display: flex;
  flex-direction: column;

  pointer-events: none;

  @media (min-width: $breakpoint-md-min) {
    right: 16px;
    top: 16px;
  }
}
</style>
