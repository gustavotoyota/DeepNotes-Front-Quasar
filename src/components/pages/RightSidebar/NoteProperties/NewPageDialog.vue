<template>
  <slot :show-dialog="() => (visible = true)"></slot>

  <q-dialog v-model="visible">
    <q-card>
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Create new page</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="padding: 0">
          <div
            style="display: flex"
            :style="{
              'flex-direction': horizontal ? 'row' : 'column',
            }"
          >
            <div style="padding: 21px; min-width: 258px">
              <q-input
                label="Page title"
                ref="pageTitleElem"
                v-model="pageTitle"
                filled
              />

              <Gap style="height: 16px" />

              <Checkbox
                label="Create within a new group"
                v-model="createGroup"
                @update:model-value="
                  async (value) => {
                    if (value) {
                      groupName = pageTitle;
                      pageTitle = 'Main page';

                      await $nextTick();

                      groupNameElem?.focus();
                    } else {
                      pageTitle = groupName;

                      await $nextTick();

                      pageTitleElem?.focus();
                    }
                  }
                "
              />
            </div>

            <template v-if="createGroup">
              <q-separator :vertical="horizontal" />

              <div style="padding: 21px">
                <q-input
                  label="Group name"
                  ref="groupNameElem"
                  filled
                  v-model="groupName"
                />

                <Gap style="height: 16px" />

                <Checkbox
                  label="Make group public for viewing"
                  v-model="publicGroup"
                />

                <Gap style="height: 16px" />

                <Checkbox
                  label="Password protect group"
                  v-model="passwordProtectGroup"
                />

                <template v-if="passwordProtectGroup">
                  <Gap style="height: 16px" />

                  <q-input
                    label="Group password"
                    type="password"
                    filled
                    v-model="groupPassword"
                  />
                </template>
              </div>
            </template>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <SmartBtn
            type="submit"
            flat
            label="Ok"
            color="primary"
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
import { encryptSymmetric } from 'src/code/crypto/crypto';
import { privateKey } from 'src/code/crypto/private-key';
import { wrapSymmetricKey } from 'src/code/crypto/symmetric-key';
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { internals } from 'src/code/pages/static/internals';
import { BREAKPOINT_MD_MIN } from 'src/code/pages/static/responsive';
import { bytesToBase64, encodeText } from 'src/code/utils';
import Gap from 'src/components/misc/Gap.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useUI } from 'src/stores/pages/ui';
import { computed, inject, Ref, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import Checkbox from '../../misc/Checkbox.vue';

const router = useRouter();
const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const visible = ref(false);

const pageTitle = ref('');
const pageTitleElem = ref<HTMLElement>();

const createGroup = ref(false);
const groupName = ref('');
const groupNameElem = ref<HTMLElement>();

const publicGroup = ref(false);

const passwordProtectGroup = ref(false);
const groupPassword = ref('');

const horizontal = computed(() => ui.width >= BREAKPOINT_MD_MIN);

watch(visible, async () => {
  if (!visible.value) {
    return;
  }

  pageTitle.value = '';

  createGroup.value = false;
  groupName.value = '';

  publicGroup.value = false;

  passwordProtectGroup.value = false;
  groupPassword.value = '';

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

async function createPage() {
  if (createGroup.value && groupName.value === '') {
    Notify.create({
      message: 'Please enter a group name.',
      type: 'negative',
    });

    return;
  }

  try {
    let groupSymmetricKey;
    let encryptedGroupSymmetricKey;
    let encryptedGroupName;

    let encryptedPageTitle;

    if (createGroup.value) {
      groupSymmetricKey = sodium.randombytes_buf(32);

      const wrappedGroupSymmetricKey = wrapSymmetricKey(groupSymmetricKey);

      if (passwordProtectGroup.value) {
        const groupPasswordHash = sodium.crypto_pwhash(
          32,
          groupPassword.value,
          new Uint8Array(sodium.crypto_pwhash_SALTBYTES),
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_ALG_ARGON2ID13
        );

        groupSymmetricKey = encryptSymmetric(
          groupSymmetricKey,
          groupPasswordHash
        );
      }

      encryptedGroupSymmetricKey = privateKey.encrypt(
        groupSymmetricKey,
        $pages.react.publicKey
      );

      encryptedGroupName = wrappedGroupSymmetricKey.encrypt(
        encodeText(groupName.value)
      );

      encryptedPageTitle = wrappedGroupSymmetricKey.encrypt(
        encodeText(pageTitle.value)
      );
    } else {
      encryptedPageTitle = page.value.react.symmetricKey.encrypt(
        encodeText(pageTitle.value)
      );
    }

    const response = await internals.api.post<{
      pageId: string;
    }>('/api/pages/create', {
      createGroup: createGroup.value,
      encryptedGroupSymmetricKey: bytesToBase64(encryptedGroupSymmetricKey),
      encryptedGroupName: bytesToBase64(encryptedGroupName),

      publicGroup: publicGroup.value,

      parentPageId: page.value.id,
      encryptedPageTitle: bytesToBase64(encryptedPageTitle),
    });

    page.value.collab.doc.transact(() => {
      for (const selectedNote of page.value.selection.react.validNotes) {
        selectedNote.react.collab.link = response.data.pageId;
      }
    });

    await $pages.goToPage(response.data.pageId, router, true);

    Notify.create({
      message: 'Page created successfully.',
      type: 'positive',
    });

    visible.value = false;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
}
</script>
