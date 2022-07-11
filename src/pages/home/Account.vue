<template>
  <q-page style="min-height: initial; margin-top: 40px; margin-bottom: 150px">
    <ResponsiveContainer style="height: 100%">
      <div
        class="row"
        style="height: 100%"
      >
        <div class="d-none d-lg-block col-3">
          <q-list>
            <q-item
              style="height: 60px"
              clickable
              to="/account/general"
            >
              <q-item-section avatar>
                <q-icon name="mdi-cog" />
              </q-item-section>
              <q-item-section> General </q-item-section>
            </q-item>

            <q-item
              style="height: 60px"
              clickable
              to="/account/security"
            >
              <q-item-section avatar>
                <q-icon name="mdi-shield" />
              </q-item-section>
              <q-item-section> Security </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="col-12 col-lg-9 page-content">
          <router-view />
        </div>
      </div>
    </ResponsiveContainer>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
</script>

<style
  lang="scss"
  scoped
>
.page-content {
  position: relative;

  display: flex;
  flex-direction: column;

  padding-left: 20px;
  padding-top: 20px;

  @media (min-width: $breakpoint-sm-min) {
    padding-left: 90px;
  }
}
</style>
