<template>
  <q-btn
    dense
    round
    style="min-height: 50px; min-width: 50px"
    :style="{
      [`border-top-${side}-radius`]: 0,
      [`border-bottom-${side}-radius`]: 0,
    }"
    class="bg-grey-9"
    @click="ui[`toggle${upperFirst(side) as 'Left' | 'Right'}Sidebar`]()"
  >
    <q-icon
      :name="
        ui[`${side}SidebarMini`]
          ? `mdi-chevron-${otherSide}`
          : `mdi-chevron-${side}`
      "
      style="position: relative"
      :style="{ [side]: -2 + 'px' }"
    />
  </q-btn>
</template>

<script
  setup
  lang="ts"
>
import { upperFirst } from 'lodash';
import { useUI } from 'src/stores/pages/ui';

const props = defineProps<{
  side: 'left' | 'right';
}>();

const otherSide = props.side === 'left' ? 'right' : 'left';

const ui = useUI();
</script>
