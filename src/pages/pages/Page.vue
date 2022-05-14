<template>
  <q-page>
    <ContentDisplay
      v-if="page != null"
      :page="page"
    />
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { factory } from 'src/code/pages/static/composition-root';
import ContentDisplay from 'src/components/pages/ContentDisplay/ContentDisplay.vue';
import { onMounted, provide, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const page = shallowRef<AppPage>();
provide('page', page);

onMounted(async () => {
  await $pages.ready;

  page.value = factory.makePage($pages, route.params.page_id as string);
  $pages.pageCache.addPage(page.value);

  const pageData = await page.value.preSync();
  page.value.postSync(pageData);
});
</script>
