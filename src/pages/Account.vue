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
        >
          <q-item-section avatar>
            <q-icon name="mdi-cog" />
          </q-item-section>
          <q-item-section> General </q-item-section>
        </q-item>
        <q-item
          style="height: 60px"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="mdi-shield" />
          </q-item-section>
          <q-item-section> Security </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page> Hello </q-page>
  </q-page-container>
</template>
