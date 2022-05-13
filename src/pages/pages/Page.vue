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
import { PagesApp } from 'src/code/pages/app/app';
import { AppPage } from 'src/code/pages/app/page/page';
import { factory } from 'src/code/pages/static/composition-root';
import ContentDisplay from 'src/components/pages/ContentDisplay/ContentDisplay.vue';
import { usePageCache } from 'src/stores/pages/page-cache';
import { usePages } from 'src/stores/pages/pages';
import { inject, onMounted, provide, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

const pagesApp = inject<PagesApp>('pagesApp')!;

const pages = usePages();
const pageCache = usePageCache();
const route = useRoute();

const page = shallowRef<AppPage>();

provide('page', page);

onMounted(async () => {
  await pages.ready;

  page.value = factory.makePage(pagesApp, route.params.page_id as string);

  pageCache.addPage(page.value);

  const pageData = await page.value.preSync();

  page.value.postSync(pageData);
});
</script>
