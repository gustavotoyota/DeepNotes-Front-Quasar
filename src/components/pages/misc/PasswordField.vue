<template>
  <q-input
    :label="label"
    :type="showPassword ? 'text' : 'password'"
    filled
    :dense="dense"
    label-color="grey-5"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-slot:append>
      <q-icon
        :name="showPassword ? 'visibility' : 'visibility_off'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>
  </q-input>
</template>

<script
  setup
  lang="ts"
>
import { ref } from 'vue';

defineProps<{
  label: string;

  modelValue: string;

  dense?: boolean;
}>();

const showPassword = ref(false);
</script>
