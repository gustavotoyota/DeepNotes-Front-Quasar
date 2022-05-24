<template>
  <LoadingOverlay />
</template>

<script
  setup
  lang="ts"
>
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  const response = await $api.post('/api/users/starting-page-id');

  await router.replace({ path: `/pages/${response.data.startingPageId}` });
});
</script>
