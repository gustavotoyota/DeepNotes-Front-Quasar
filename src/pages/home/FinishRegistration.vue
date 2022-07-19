<template>
  <q-page style="min-height: initial">
    <ResponsiveContainer style="margin: 180px auto; text-align: center">
      <template v-if="route.params.email != null">
        <div style="font-size: 16px">
          We've sent a verification link to<br />
          <span style="color: #03a9f4">{{ route.params.email }}</span
          >.<br />
          Check your e-mail to proceed.
        </div>

        <Gap style="height: 32px" />
      </template>

      <q-btn
        label="Go to login"
        color="primary"
        style="font-size: 16px; padding: 10px 22px"
        to="/login"
      />
    </ResponsiveContainer>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import Gap from 'src/components/misc/Gap.vue';
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>
