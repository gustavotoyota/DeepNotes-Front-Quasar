<template>
  <q-btn
    v-bind=" {
      ...$attrs,
      onClick: async (event) => {
        if ($attrs.onClick == null) {
          return;
        }

        loading = true

        await ($attrs.onClick as any)?.(event)

        loading = false
      }
    }
    "
    :loading="loading"
  >
    <slot></slot>
  </q-btn>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script
  setup
  lang="ts"
>
import { ref } from 'vue';

const loading = ref(false);
</script>
