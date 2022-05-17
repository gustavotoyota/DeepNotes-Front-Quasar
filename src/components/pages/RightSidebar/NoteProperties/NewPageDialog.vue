<template>
  <q-btn
    label="Create new page"
    color="primary"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">New page</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            label="Page name"
            ref="pageNameElem"
            v-model="pageName"
            filled
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <q-btn
            type="submit"
            flat
            label="Ok"
            color="primary"
            v-close-popup
            @click.prevent="createPage()"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { inject, Ref, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const page = inject<Ref<AppPage>>('page')!;

const visible = ref(false);

const pageName = ref('');
const pageNameElem = ref<HTMLElement>();

watch(visible, () => {
  if (!visible.value) {
    return;
  }

  setTimeout(() => {
    pageName.value = '';

    const activeElem = $pages.react.page.activeElem.react.elem;
    if (!(activeElem instanceof PageNote)) {
      return;
    }

    if (activeElem.react.topSection === 'container') {
      return;
    }

    const text = activeElem.collab[activeElem.react.topSection].value;
    pageName.value = text.toJSON().split('\n')[0];

    pageNameElem.value?.focus();
  });
});

async function createPage() {
  const response = await $api.post<{
    pageId: string;
  }>('/api/pages/create', {
    parentPageId: page.value.id,
    pageName: pageName.value,
  });

  for (const selectedNote of page.value.selection.react.notes) {
    selectedNote.collab.link = response.data.pageId;
  }

  $pages.navigateTo(response.data.pageId, router, true);
}
</script>
