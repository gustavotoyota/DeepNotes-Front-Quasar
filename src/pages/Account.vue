<template>
  <q-page-container>
    <q-drawer
      persistent
      :breakpoint="0"
      :model-value="true"
      :overlay="false"
      :show-if-above="true"
      :no-swipe-open="true"
      :no-swipe-close="true"
      :no-swipe-backdrop="true"
    >
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
    </q-drawer>

    <q-page>
      <div
        style="position: absolute; inset: 0; padding: 48px; overflow-y: auto"
        class="bg-grey-10"
      >
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </q-page>
  </q-page-container>
</template>
