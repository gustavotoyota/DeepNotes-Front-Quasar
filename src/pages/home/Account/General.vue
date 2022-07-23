<template>
  <template v-if="mounted">
    <h5 style="margin-block-start: 0; margin-block-end: 0">E-mail</h5>

    <Gap style="height: 8px" />

    <q-separator />

    <Gap style="height: 24px" />

    <div style="display: flex; flex-direction: column; max-width: 300px">
      <q-input
        filled
        dense
        v-model="email"
      />

      <Gap style="height: 16px" />

      <SmartBtn
        label="Change e-mail"
        color="primary"
      />
    </div>
  </template>

  <LoadingOverlay v-else />
</template>

<script
  setup
  lang="ts"
>
import { useMeta } from 'quasar';
import { internals } from 'src/code/app/internals';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { useApp } from 'src/stores/app';
import { onMounted, ref } from 'vue';

const app = useApp();

useMeta(() => ({
  title: 'General - Account - DeepNotes',
}));

const email = ref('');

const mounted = ref(false);

onMounted(async () => {
  await app.ready;

  const response = await internals.api.post<{
    email: string;
  }>('/api/users/account/general/load');

  email.value = response.data.email;

  mounted.value = true;
});
</script>
