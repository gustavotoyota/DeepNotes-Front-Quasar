<template>
  <q-page style="min-height: initial">
    <div style="height: 80px"></div>

    <ResponsiveContainer>
      <div class="row">
        <div
          class="col-12 col-md-6"
          style="display: flex; flex-direction: column; justify-content: center"
        >
          <div class="main-text">
            <div class="big-main-text">
              The ultimate<br />
              note-taking app
            </div>

            <div style="height: 12px"></div>

            <div class="d-block d-sm-none small-main-text">
              Organize your notes however you like. Move, resize, expand,
              collapse, link, colorize. Super simple, but extremely powerful.
            </div>
            <div class="d-none d-sm-block small-main-text">
              Organize your notes however you like.<br />
              Move, resize, expand, collapse, link, colorize.<br />
              Super simple, but extremely powerful.
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
            <div class="big-secondary-text">
              Graph-based<br />
              page navigation
            </div>

            <div style="height: 12px"></div>

            <div class="d-block d-xl-none small-secondary-text">
              Your pages aren't tied to a pre-determined index structure.
              Navigate by linking your pages through your notes. You create your
              own index, in your own style.
            </div>
            <div class="d-none d-xl-block small-secondary-text">
              Your pages aren't tied to a pre-determined index structure.
              Navigate by linking your pages through your notes.<br />
              You create your own index, in your own style.
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>

    <div style="height: 140px"></div>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import { useAuth } from 'src/stores/auth';

const auth = useAuth();
</script>

<style lang="scss">
.main-text {
  text-align: center;

  @media (min-width: $breakpoint-md-min) {
    text-align: left;
  }
}
.big-main-text {
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
.small-main-text {
  margin: auto;

  font-size: 16px;
  max-width: 360px;

  @media (min-width: $breakpoint-md-min) {
    margin: 0;
    max-width: 300px;
  }
  @media (min-width: $breakpoint-lg-min) {
    margin: 0;
    max-width: 360px;
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
.big-secondary-text {
  @extend .big-main-text;
}
.small-secondary-text {
  @extend .small-main-text;

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
