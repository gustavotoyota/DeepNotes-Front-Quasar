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
import { DeepNotesApp } from 'src/code/pages/app/app';
import { AppPage } from 'src/code/pages/app/page/page';
import { factory } from 'src/code/pages/static/composition-root';
import ContentDisplay from 'src/components/pages/ContentDisplay/ContentDisplay.vue';
import { usePageCache } from 'src/stores/pages/page-cache';
import { inject, onMounted, provide, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

const app = inject<DeepNotesApp>('app')!;

const pageCache = usePageCache();
const route = useRoute();

const page = shallowRef<AppPage>();

provide('page', page);

onMounted(async () => {
  page.value = factory.makePage(app, route.params.page_id as string);

  pageCache.addPage(page.value);

  await page.value.preSync();

  page.value.postSync();
});
</script>
