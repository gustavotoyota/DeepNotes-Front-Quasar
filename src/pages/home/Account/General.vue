<template>
  <template v-if="mounted">
    <q-input
      label="Display name"
      v-model="data.displayName"
      style="max-width: 300px"
      filled
    />

    <Gap style="height: 24px" />

    <q-btn
      label="Save"
      color="primary"
      style="max-width: 300px; height: 40px"
      @click="save()"
    />
  </template>

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import { Notify, useMeta } from 'quasar';
import { internals } from 'src/code/pages/static/internals';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import { useApp } from 'src/stores/app';
import { onMounted, reactive, ref } from 'vue';

const app = useApp();

useMeta(() => ({
  title: 'General - Account - DeepNotes',
}));

const data = reactive({
  displayName: '',
});

const mounted = ref(false);

onMounted(async () => {
  await app.ready;

  const response = await internals.api.post('/api/users/account/general/load');

  data.displayName = response.data.displayName;

  mounted.value = true;
});

async function save() {
  try {
    await internals.api.post('/api/users/account/general/save', {
      displayName: data.displayName,
    });

    Notify.create({
      message: 'User settings saved.',
      type: 'positive',
    });
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
}
</script>
