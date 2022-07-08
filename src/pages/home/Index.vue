<template>
  <div
    class="container"
    style="padding: 0px 32px"
  >
    <div style="display: flex; margin: 20px 0px; align-items: center">
      <a
        href="/"
        style="
          font-size: 27px;
          font-weight: bold;
          display: flex;
          align-items: center;
        "
      >
        <img
          src="icons/favicon-96x96.png"
          style="margin-top: -3px; width: 46px; height: 46px"
        />

        <div style="width: 16px"></div>

        DeepNotes
      </a>

      <div style="width: 32px"></div>

      <div
        class="d-none d-md-flex"
        style="flex: 1; align-items: center"
      >
        <!--
        <q-btn
          label="Features"
          flat
          class="toolbar-btn"
        />

        <div style="width: 16px"></div>

        <q-btn
          label="Pricing"
          flat
          class="toolbar-btn"
        />
        -->

        <q-space />

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
    </div>

    <div style="height: 80px"></div>

    <div class="row">
      <div
        class="col-12 col-md-6"
        style="display: flex; flex-direction: column; justify-content: center"
      >
        <div class="main-text">
          <div class="big-text">
            The ultimate<br />
            note-taking app
          </div>

          <div style="height: 12px"></div>

          <div class="small-text">
            Organize your notes however you like. Cluster, group, drag, expand,
            collapse, resize, link, colorize. Super simple, but extremely
            powerful.
          </div>

          <template v-if="!auth.loggedIn">
            <div style="height: 32px"></div>

            <div>
              <q-btn
                color="secondary"
                label="Get Started"
                class="cta-btn"
                to="/register"
              />
            </div>
          </template>
        </div>
      </div>

      <div
        class="col-12 col-md-6"
        style="text-align: center"
      >
        <div
          class="d-block d-md-none"
          style="height: 110px"
        ></div>

        <img
          src="/showcase.png"
          style="max-width: 100%"
        />
      </div>
    </div>

    <div style="height: 100px"></div>

    <div
      class="row"
      style="margin: 0px -16px"
    >
      <div class="col-12 col-md-4 card-column">
        <div class="card">
          <div style="font-size: 24px; font-weight: bold">
            End-to-end encryption
          </div>

          <div style="height: 16px"></div>

          <div>
            Your notes are protected using modern encryption algorithms. The
            server cannot decrypt any of your data and exists only for data
            transport and storage.
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4 card-column">
        <div class="card">
          <div style="font-size: 24px; font-weight: bold">
            Realtime collaboration
          </div>

          <div style="height: 16px"></div>

          <div>
            Collaborate with your team or work simultaneously from multiple
            devices.
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4 card-column">
        <div class="card">
          <div style="font-size: 24px; font-weight: bold">Spatial notes</div>

          <div style="height: 16px"></div>

          <div>
            Your ideas don't need to be constrained to a big wall of text. Use
            containers to organize your notes or even create your own
            collaborative Kanban boards.
          </div>
        </div>
      </div>
    </div>

    <div style="height: 100px"></div>

    <div class="row">
      <div
        class="col-12 col-md-6"
        style="text-align: center"
      >
        <img
          src="/page-navigation.png"
          style="max-width: 100%"
        />

        <div
          class="d-block d-md-none"
          style="height: 100px"
        ></div>
      </div>
      <div
        class="col-12 col-md-6"
        style="display: flex; flex-direction: column; justify-content: center"
      >
        <div class="secondary-text">
          <div class="big-text">
            Graph-based<br />
            page navigation
          </div>

          <div style="height: 12px"></div>

          <div class="small-text">
            Your pages aren't tied to a pre-determined index structure. You
            navigate by linking your pages through your notes. You create your
            own index, in your own style.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div style="height: 140px"></div>

  <div style="padding: 80px 0px; background-color: #202020">
    <div
      class="container"
      style="padding: 0px 32px; font-size: 16px"
    >
      © 2022 Gustavo T. Toyota
    </div>
  </div>
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

<style lang="scss">
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

.main-text {
  text-align: center;

  @media (min-width: $breakpoint-md-min) {
    text-align: left;
  }
}
.secondary-text {
  @extend .main-text;

  @media (min-width: $breakpoint-md-min) {
    margin-left: 40px;
    margin-top: -16px;
  }
  @media (min-width: $breakpoint-lg-min) {
    margin-top: -30px;
  }
}
.big-text {
  font-weight: bold;
  font-size: 42px;

  @media (min-width: $breakpoint-sm-min) {
    font-size: 46px;
  }
  @media (min-width: $breakpoint-md-min) {
    font-size: 40px;
  }
  @media (min-width: $breakpoint-lg-min) {
    font-size: 54px;
  }
  @media (min-width: $breakpoint-xl-min) {
    font-size: 56px;
  }
}
.small-text {
  margin: auto;

  font-size: 16px;
  max-width: 360px;

  @media (min-width: $breakpoint-md-min) {
    margin: 0;
    max-width: 300px;
  }
  @media (min-width: $breakpoint-lg-min) {
    margin: 0;
    max-width: 410px;
  }
}

.cta-btn {
  font-size: 22px;
  font-weight: bold;

  @media (min-width: $breakpoint-lg-min) {
    font-size: 26px;

    padding-left: 20px;
    padding-right: 20px;
  }
}

.card-column {
  display: flex;
  justify-content: center;
}
.card {
  width: 100%;

  margin: 0px 16px;
  margin-bottom: 30px;

  border: 1px solid white;
  border-radius: 10px;
  padding: 30px;
}
</style>
