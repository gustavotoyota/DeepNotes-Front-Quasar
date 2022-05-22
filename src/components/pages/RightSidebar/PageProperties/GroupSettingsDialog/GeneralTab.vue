<template>
  <div style="display: contents">
    <q-input
      label="Group name"
      v-model="groupName"
      filled
      dense
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { ref } from 'vue';

const groupName = ref('');

defineExpose({
  groupName,
});
</script>
