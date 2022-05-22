<template>
  <div style="display: contents"></div>
</template>

<script
  setup
  lang="ts"
>
import { ref } from 'vue';

const users = ref<
  {
    id: string;
    role_id: string;
  }[]
>([]);

defineExpose({
  users,
});
</script>
