<template>
  <slot
    :on="{
      click: () => {
        fileType = 'local';

        localFile = undefined;
        imageURL = '';

        visible = true;
      },
    }"
  >
  </slot>

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Request access</div>
        </q-card-section>

        <q-separator />

        <q-card-section
          style="padding: 21px; display: flex; flex-direction: column"
        >
          <q-radio
            label="Local image:"
            val="local"
            dense
            v-model="fileType"
          />

          <Gap style="height: 12px" />

          <q-file
            label="Click here to select"
            filled
            dense
            accept="image/*"
            :disable="fileType !== 'local'"
            v-model="localFile"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-image" />
            </template>
          </q-file>

          <Gap style="height: 24px" />

          <q-radio
            label="External image:"
            val="external"
            dense
            v-model="fileType"
          />

          <Gap style="height: 12px" />

          <q-input
            label="Image URL"
            filled
            dense
            accept="image/*"
            :disable="fileType !== 'external'"
            v-model="imageURL"
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
            flat
            label="Ok"
            color="primary"
            @click="insertImage"
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
import { computed } from '@vue/reactivity';
import Gap from 'src/components/misc/Gap.vue';
import { ref } from 'vue';

const page = computed(() => $pages.react.page);

const visible = ref(false);

const fileType = ref('local');

const localFile = ref<File>();
const imageURL = ref('');

async function insertImage() {
  let imageFile;

  if (fileType.value === 'local') {
    imageFile = localFile.value!;
  } else {
    const response = await fetch(imageURL.value);

    imageFile = await response.blob();
  }

  const reader = new FileReader();

  reader.addEventListener('loadend', (event) => {
    page.value.selection.format((chain) =>
      chain.setImage({
        src: event.target!.result as string,
      })
    );
  });

  reader.readAsDataURL(imageFile);

  visible.value = false;
}
</script>
