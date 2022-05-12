<template>
  <div></div>
</template>

<script
  setup
  lang="ts"
>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  const response = await $api.post('/api/users/starting-page-id');

  router.replace({ path: `/pages/${response.data.startingPageId}` });
});
</script>
