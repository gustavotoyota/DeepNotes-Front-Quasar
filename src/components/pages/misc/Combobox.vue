<template>
  <q-select
    ref="combobox"
    :label="label"
    :options="options"
    :model-value="modelValue"
    @input-value="$emit('update:model-value', $event)"
    filled
    dense
    use-input
    fill-input
    emit-value
    hide-selected
  >
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        @click="combobox.updateInputValue(scope.opt.value)"
      >
        <slot
          name="item"
          v-bind="scope"
        >
          <q-item-section>{{ scope.opt.label }}</q-item-section>
        </slot>
      </q-item>
    </template>
  </q-select>
</template>

<script
  setup
  lang="ts"
>
import { ref } from 'vue';

defineProps<{
  label: string;
  options: any;
  modelValue: any;
}>();

const combobox = ref();
</script>
