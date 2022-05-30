<template>
  <q-layout view="hHh Lpr fff">
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
            label="Pages"
            color="primary"
            to="/pages"
          />

          <Gap style="width: 12px" />

          <ToolbarBtn
            tooltip="Account"
            icon="mdi-account-circle"
            icon-size="42px"
            btn-size="44px"
            round
          >
            <q-menu
              anchor="bottom right"
              self="top right"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  to="/account/general"
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-account" />
                  </q-item-section>
                  <q-item-section>Account</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="logout($router)"
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-logout" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </ToolbarBtn>
        </template>
      </q-toolbar>
    </q-header>

    <router-view />
  </q-layout>
</template>

<script
  setup
  lang="ts"
>
import { logout } from 'src/code/auth';
import Gap from 'src/components/misc/Gap.vue';
import ToolbarBtn from 'src/components/pages/misc/ToolbarBtn.vue';
import { useAuth } from 'src/stores/auth';

const auth = useAuth();
</script>
