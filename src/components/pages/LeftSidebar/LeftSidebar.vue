<template>
  <q-drawer
    show-if-above
    :mini="ui.leftSidebarMini"
    side="left"
    bordered
    no-swipe-open
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
  >
    <div style="flex: 1; display: flex; flex-direction: column">
      <q-toolbar style="width: 299px">
        <q-avatar
          icon="mdi-animation"
          size="50px"
          style="margin-left: -9px"
        />

        <q-toolbar-title style="margin-left: 6px">Path</q-toolbar-title>
      </q-toolbar>

      <q-list
        :class="{
          mini: ui.leftSidebarMini,
        }"
        style="flex: 1"
      >
        <MiniSidebarPage
          v-for="pathPageId in $pages.react.pathPageIds"
          :key="pathPageId"
          :page-id="pathPageId"
          @click="$pages.goToPage(pathPageId, $router)"
        />
      </q-list>
    </div>

    <q-separator />

    <div
      v-if="page != null"
      style="flex: 1; display: flex; flex-direction: column"
    >
      <q-toolbar style="width: 299px">
        <q-avatar
          icon="mdi-layers-triple"
          size="50px"
          style="margin-left: -9px"
        />

        <q-toolbar-title style="margin-left: 6px">Layers</q-toolbar-title>

        <q-btn
          icon="mdi-plus"
          round
          flat
          style="min-width: 32px; min-height: 32px; width: 32px; height: 32px"
          @click="createLayer()"
        />
      </q-toolbar>

      <q-list style="flex: 1">
        <template
          v-for="(layerId, layerIndex) in page.react.collab.layerIds"
          :key="layerId"
        >
          <template
            v-for="layer in [page.layers.fromId(layerId)]"
            :key="layer?.id"
          >
            <q-item
              v-if="layer != null"
              :active="layer.id == page.react.currentLayer.id"
              clickable
              @click="page.react.currentLayerId = layer.id"
            >
              <q-item-section avatar>
                <q-icon name="mdi-layers" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ layer.react.collab.name }}</q-item-label>
              </q-item-section>

              <q-item-section
                v-if="layerIndex > 0"
                side
                style="padding: 0"
              >
                <q-btn
                  icon="mdi-arrow-up"
                  round
                  flat
                  style="
                    min-width: 32px;
                    min-height: 32px;
                    width: 32px;
                    height: 32px;
                  "
                  @click="swapLayers(layerIndex - 1)"
                />
              </q-item-section>

              <q-item-section
                v-if="layerIndex < page.react.collab.layerIds.length - 1"
                side
                style="padding: 0"
              >
                <q-btn
                  icon="mdi-arrow-down"
                  round
                  flat
                  style="
                    min-width: 32px;
                    min-height: 32px;
                    width: 32px;
                    height: 32px;
                  "
                  @click="swapLayers(layerIndex)"
                />
              </q-item-section>

              <q-item-section
                side
                style="padding: 0"
              >
                <q-btn
                  icon="mdi-delete"
                  round
                  flat
                  style="
                    min-width: 32px;
                    min-height: 32px;
                    width: 32px;
                    height: 32px;
                  "
                  @click="deleteLayer(layerIndex)"
                />
              </q-item-section>
            </q-item>
          </template>
        </template>
      </q-list>
    </div>
  </q-drawer>
</template>

<script
  setup
  lang="ts"
>
import { computed } from '@vue/reactivity';
import { Dialog, Notify } from 'quasar';
import { useUI } from 'src/stores/pages/ui';
import { v4 } from 'uuid';

import MiniSidebarPage from '../misc/MiniSidebarPage.vue';

const ui = useUI();

const page = computed(() => $pages.react.page);

function swapLayers(layerIndex: number) {
  page.value.react.collab.layerIds.splice(
    layerIndex,
    2,
    page.value.react.collab.layerIds[layerIndex + 1],
    page.value.react.collab.layerIds[layerIndex]
  );
}

function deleteLayer(layerIndex: number) {
  if (page.value.react.collab.layerIds.length <= 1) {
    Notify.create({
      message: 'You must have at least one layer.',
      color: 'negative',
    });

    return;
  }

  page.value.collab.doc.transact(() => {
    const layerId = page.value.react.collab.layerIds.splice(layerIndex, 1)[0];

    delete page.value.layers.react.collab[layerId];
  });
}

function createLayer() {
  Dialog.create({
    title: 'Add new layer',
    message: 'Name:',
    prompt: {
      model: '',
    },
    style: {
      width: '300px',
    },
    cancel: true,
  }).onOk((name) => {
    const layerId = v4();

    page.value.react.collab.layerIds.push(layerId);

    page.value.layers.react.collab[layerId] = {
      name,

      noteIds: [],
      arrowIds: [],

      nextZIndex: 0,
    };
  });
}
</script>

<style scoped>
.q-drawer-container:deep(.q-drawer__content) {
  display: flex;
  flex-direction: column;
}
</style>
