<template>
  <q-btn
    class="display-btn"
    :icon="icon"
    color="grey-9"
    dense
    @click="$emit('click', $event)"
  >
    <q-tooltip
      anchor="center left"
      self="center right"
      transition-show="jump-right"
      transition-hide="jump-left"
    >
      {{ tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script
  setup
  lang="ts"
>
defineProps<{
  icon: string;
  tooltip: string;
}>();
</script>

<style scoped>
.display-btn {
  min-width: 36px;
  height: 36px;

  padding: 0;
}
</style>
