<template>
  <q-layout view="lHh lpr fff">
    <q-header
      elevated
      class="bg-grey-10"
    >
      <q-toolbar style="height: 64px">
        <q-toolbar-title>DeepNotes</q-toolbar-title>

        <q-btn
          label="Home"
          flat
          to="/"
        />
        <q-btn
          label="Login"
          flat
          to="/login"
        />
        <q-btn
          label="Sign up"
          flat
          to="/register"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      class="bg-grey-10"
      style="padding: 20px"
    >
      Blablabla
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',
});
</script>
