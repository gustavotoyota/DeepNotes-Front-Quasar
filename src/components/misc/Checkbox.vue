<template>
  <q-checkbox
    class="checkbox"
    :label="label"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :disable="disable"
  />
</template>

<script
  setup
  lang="ts"
>
defineProps<{
  label: string;
  modelValue?: boolean;
  disable?: boolean;
}>();
</script>

<style scoped>
.checkbox {
  flex: 1;

  margin-left: -10px;
  margin-top: -10px;
  margin-bottom: -10px;
}
</style>
