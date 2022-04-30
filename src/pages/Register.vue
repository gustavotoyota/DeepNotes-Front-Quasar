<template>
  <q-page style="display: flex; justify-content: center; align-items: center">
    <q-form
      style="
        width: 270px;
        padding: 24px;
        background-color: #303030;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
      "
    >
      <q-input
        label="E-mail"
        filled
        dense
        label-color="grey-5"
        v-model="data.email"
      />

      <Gap style="height: 12px" />

      <q-input
        label="Display name"
        filled
        dense
        label-color="grey-5"
        v-model="data.displayName"
      />

      <Gap style="height: 12px" />

      <q-input
        label="Password"
        type="password"
        filled
        dense
        label-color="grey-5"
        v-model="data.password"
      />

      <Gap style="height: 12px" />

      <q-input
        label="Repeat password"
        type="password"
        filled
        dense
        label-color="grey-5"
        v-model="data.repeatPassword"
      />

      <Gap style="height: 20px" />

      <q-btn
        label="Create account"
        type="submit"
        color="primary"
        @click.prevent="onSubmit()"
      />
    </q-form>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import { reactive } from 'vue';

import Gap from '../components/misc/Gap.vue';

const data = reactive({
  email: '',
  displayName: '',
  password: '',
  repeatPassword: '',
});

function onSubmit() {
  //
}
</script>
