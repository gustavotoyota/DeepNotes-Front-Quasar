<template>
  <q-page style="min-height: initial">
    <ResponsiveContainer
      v-if="status !== undefined"
      style="margin: 160px auto; text-align: center"
    >
      <template v-if="status">
        <div style="font-size: 16px">Your e-mail has been verified.</div>

        <Gap style="height: 16px" />

        <div>
          <q-icon
            name="done"
            size="48px"
            color="green"
          />
        </div>

        <Gap style="height: 24px" />

        <q-btn
          label="Go to Login"
          color="primary"
          style="font-size: 16px; padding: 10px 22px"
          to="/login"
        />
      </template>

      <template v-else>
        <div style="font-size: 16px">Invalid e-mail confirmation code.</div>

        <Gap style="height: 24px" />

        <q-btn
          label="Go home"
          color="primary"
          style="font-size: 16px; padding: 10px 22px"
          to="/"
        />
      </template>
    </ResponsiveContainer>
  </q-page>

  <LoadingOverlay v-if="status === undefined" />
</template>

<script
  setup
  lang="ts"
>
import { useMeta } from 'quasar';
import { internals } from 'src/code/app/internals';
import Gap from 'src/components/misc/Gap.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

useMeta({
  title: 'Email Verification - DeepNotes',
});

const route = useRoute();

const status = ref<boolean | undefined>(undefined);

onMounted(async () => {
  try {
    await internals.api.post('/auth/email-verification', {
      emailVerificationCode: route.params.code,
    });

    status.value = true;
  } catch (err) {
    console.log(err);

    status.value = false;
  }
});
</script>
