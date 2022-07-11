<template>
  <q-btn
    label="Create new page"
    color="primary"
    :disable="page.react.readonly"
    @click="visible = true"
  />

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Create new page</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="padding: 21px">
          <q-input
            label="Page title"
            ref="pageTitleElem"
            v-model="pageTitle"
            filled
          />

          <Gap style="height: 16px" />

          <Checkbox
            label="Create as main page of a new group"
            v-model="createGroup"
          />

          <template v-if="createGroup">
            <Gap style="height: 16px" />

            <q-input
              label="Group name"
              ref="groupNameElem"
              filled
              v-model="groupName"
            />
          </template>
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
            :loading="loading"
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
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { privateKey } from 'src/code/crypto/private-key';
import { wrapSymmetricKey } from 'src/code/crypto/symmetric-key';
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { encodeText } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import { inject, nextTick, Ref, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import Checkbox from '../../misc/Checkbox.vue';

const router = useRouter();
const page = inject<Ref<AppPage>>('page')!;

const visible = ref(false);
const loading = ref(false);

const pageTitle = ref('');
const pageTitleElem = ref<HTMLElement>();

const createGroup = ref(false);
const groupName = ref('');
const groupNameElem = ref<HTMLElement>();

watch(visible, async () => {
  if (!visible.value) {
    return;
  }

  pageTitle.value = '';
  createGroup.value = false;
  groupName.value = '';

  setTimeout(() => {
    const activeElem = $pages.react.page.activeElem.react.elem;
    if (!(activeElem instanceof PageNote)) {
      return;
    }

    if (activeElem.react.topSection === 'container') {
      return;
    }

    const text = activeElem.react.collab[activeElem.react.topSection].value;
    pageTitle.value = text.toDOM().textContent!.split('\n')[0];

    pageTitleElem.value?.focus();
  });
});

watch(createGroup, async (value) => {
  if (!value) {
    return;
  }

  await nextTick();

  groupNameElem.value?.focus();
});

async function createPage() {
  if (createGroup.value && groupName.value === '') {
    Notify.create({
      message: 'Please enter a group name.',
      color: 'negative',
    });

    return;
  }

  try {
    loading.value = true;

    let groupSymmetricKey;
    let encryptedGroupSymmetricKey;
    let encryptedGroupName;

    let encryptedPageTitle;

    if (createGroup.value) {
      groupSymmetricKey = sodium.randombytes_buf(32);

      encryptedGroupSymmetricKey = privateKey.encrypt(
        groupSymmetricKey,
        $pages.react.publicKey
      );

      const wrappedGroupSymmetricKey = wrapSymmetricKey(groupSymmetricKey);

      encryptedGroupName = sodium.to_base64(
        wrappedGroupSymmetricKey.encrypt(encodeText(groupName.value))
      );

      encryptedPageTitle = sodium.to_base64(
        wrappedGroupSymmetricKey.encrypt(encodeText(pageTitle.value))
      );
    } else {
      encryptedPageTitle = sodium.to_base64(
        page.value.react.symmetricKey.encrypt(encodeText(pageTitle.value))
      );
    }

    const response = await $api.post<{
      pageId: string;
    }>('/api/pages/create', {
      createGroup: createGroup.value,
      encryptedGroupSymmetricKey: encryptedGroupSymmetricKey
        ? sodium.to_base64(encryptedGroupSymmetricKey)
        : undefined,
      encryptedGroupName,

      parentPageId: page.value.id,
      encryptedPageTitle,
    });

    page.value.collab.doc.transact(() => {
      for (const selectedNote of page.value.selection.react.notes) {
        selectedNote.react.collab.link = response.data.pageId;
      }
    });

    await $pages.goToPage(response.data.pageId, router, true);

    Notify.create({
      message: 'Page created successfully.',
      color: 'positive',
    });

    visible.value = false;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }

  loading.value = false;
}
</script>
