<template>
  <LoadingOverlay />
</template>

<script
  setup
  lang="ts"
>
import { internals } from 'src/code/static/internals';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  const response = await internals.api.post('/api/users/starting-page-id');

  await router.replace({ path: `/pages/${response.data.startingPageId}` });
});
</script>
