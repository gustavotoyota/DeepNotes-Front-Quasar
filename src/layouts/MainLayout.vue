<template>
  <q-layout view="hHh lpr fff">
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

        <template v-if="!auth.loggedIn">
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
        </template>

        <template v-else>
          <q-btn
            label="Account"
            flat
            to="/account/general"
          />
          <q-btn
            label="Pages"
            flat
            to="/"
          />
          <q-btn
            label="Logout"
            flat
            to="/"
            @click="logout($api)"
          />
        </template>
      </q-toolbar>
    </q-header>

    <router-view />

    <q-footer
      class="bg-grey-10"
      style="padding: 20px"
    >
      Blablabla
    </q-footer>
  </q-layout>
</template>

<script
  setup
  lang="ts"
>
import { logout } from 'src/codes/auth';
import { useAuth } from 'src/stores/auth';

const auth = useAuth();
</script>
