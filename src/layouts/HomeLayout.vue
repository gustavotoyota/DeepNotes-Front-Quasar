<template>
  <q-layout view="hhh Lpr fff">
    <q-header
      class="bg-grey-10"
      style="background-color: #181818 !important"
    >
      <q-toolbar style="padding: 20px 0px">
        <ResponsiveContainer style="display: flex; align-items: center">
          <q-btn
            v-if="route.path.startsWith('/account/')"
            icon="mdi-menu"
            flat
            class="d-flex d-lg-none"
            style="font-size: 20px"
          >
            <q-menu
              anchor="bottom left"
              self="top left"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  to="/account/general"
                  style="padding: 16px 24px; font-size: 16px"
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-cog" />
                  </q-item-section>
                  <q-item-section>General</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  to="/account/security"
                  style="padding: 16px 24px; font-size: 16px"
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-shield" />
                  </q-item-section>
                  <q-item-section>Security</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-toolbar-title style="overflow: visible; padding: 0px">
            <router-link
              to="/"
              style="
                font-size: 27px;
                font-weight: bold;
                display: flex;
                align-items: center;
              "
            >
              <img
                src="/icons/favicon-96x96.png"
                style="margin-top: -3px; width: 46px; height: 46px"
              />

              <div style="width: 16px"></div>

              DeepNotes
            </router-link>
          </q-toolbar-title>

          <q-btn
            icon="mdi-menu"
            flat
            class="d-flex d-md-none"
            style="font-size: 20px"
          >
            <q-menu
              anchor="bottom right"
              self="top right"
            >
              <q-list style="width: 150px">
                <template v-if="!auth.loggedIn">
                  <q-item
                    clickable
                    v-close-popup
                    to="/login"
                    style="padding: 16px 24px; font-size: 16px"
                  >
                    <q-item-section>Login</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    to="/register"
                    style="padding: 16px 24px; font-size: 16px"
                  >
                    <q-item-section>Register</q-item-section>
                  </q-item>
                </template>

                <template v-else>
                  <q-item
                    clickable
                    v-close-popup
                    to="/pages"
                    style="padding: 16px 24px; font-size: 16px"
                  >
                    <q-item-section>Go to Pages</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    to="/account/general"
                    style="padding: 16px 24px; font-size: 16px"
                  >
                    <q-item-section>Account</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="logout()"
                    style="padding: 16px 24px; font-size: 16px"
                  >
                    <q-item-section>Logout</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>

          <div class="d-none d-md-flex">
            <template v-if="!auth.loggedIn">
              <q-btn
                label="Login"
                flat
                class="toolbar-btn"
                to="/login"
              />

              <div style="width: 16px"></div>

              <q-btn
                label="Sign Up"
                flat
                class="toolbar-btn"
                to="/register"
              />
            </template>

            <template v-else>
              <q-btn
                label="Go to Pages"
                color="secondary"
                to="/pages"
                style="height: 44px"
              />

              <Gap style="width: 32px" />

              <ToolbarBtn
                tooltip="Account"
                icon="mdi-account-circle"
                icon-size="46px"
                btn-size="48px"
                round
                style="margin: 0"
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
                      @click="logout()"
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
          </div>
        </ResponsiveContainer>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer style="padding: 80px 0px; background-color: #202020">
      <ResponsiveContainer> © 2022 Gustavo T. Toyota </ResponsiveContainer>
    </q-footer>
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
import { useRoute } from 'vue-router';

import ResponsiveContainer from '../components/misc/ResponsiveContainer.vue';

const auth = useAuth();
const route = useRoute();
</script>

<style>
a {
  text-decoration: none;

  color: unset;
}

body {
  background-color: #181818 !important;
}

.toolbar-btn {
  font-size: 16px;
  font-weight: normal;
  text-transform: none;
}
</style>
