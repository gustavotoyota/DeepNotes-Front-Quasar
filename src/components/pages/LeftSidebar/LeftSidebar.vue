<template>
  <q-drawer
    :mini="!ui.leftSidebarExpanded"
    :model-value="ui.leftSidebarVisible || ui.leftSidebarExpanded"
    side="left"
    bordered
    no-swipe-open
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
  >
    <div style="flex: 1; display: flex; flex-direction: column; height: 0">
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
          mini: !ui.leftSidebarExpanded,
        }"
        style="flex: 1; height: 0; overflow-y: auto"
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

    <div style="flex: 1; display: flex; flex-direction: column; height: 0">
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

      <q-list
        v-if="region.react.collab.layerIds != null"
        style="flex: 1; height: 0; overflow-y: auto"
      >
        <template
          v-for="(layerId, layerIndex) in region.react.collab.layerIds
            .slice()
            .reverse()"
          :key="layerId"
        >
          <template
            v-for="layer in [page.layers.fromId(layerId)]"
            :key="layer?.id"
          >
            <q-item
              v-if="layer != null"
              :active="layer.id == region.react.activeLayer.id"
              clickable
              @click="region.react.activeLayerId = layer.id"
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
                  @click="swapLayers(invertLayerIndex(layerIndex))"
                />
              </q-item-section>

              <q-item-section
                v-if="layerIndex < region.react.collab.layerIds.length - 1"
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
                  @click="swapLayers(invertLayerIndex(layerIndex + 1))"
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
                  @click="deleteLayer(invertLayerIndex(layerIndex))"
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
import { Dialog, Notify } from 'quasar';
import { ILayerCollab } from 'src/code/pages/app/page/layers/layer';
import { useUI } from 'src/stores/pages/ui';
import { v4 } from 'uuid';
import { computed } from 'vue';

import MiniSidebarPage from '../misc/MiniSidebarPage.vue';

const ui = useUI();

const page = computed(() => $pages.react.page);

const region = computed(() => page.value.activeRegion.react.region);

function invertLayerIndex(layerIndex: number): number {
  return region.value.react.collab.layerIds.length - 1 - layerIndex;
}

function swapLayers(layerIndex: number) {
  region.value.react.collab.layerIds.splice(
    layerIndex,
    2,
    region.value.react.collab.layerIds[layerIndex + 1],
    region.value.react.collab.layerIds[layerIndex]
  );
}

function deleteLayer(layerIndex: number) {
  if (region.value.react.collab.layerIds.length <= 1) {
    Notify.create({
      message: 'You must have at least one layer.',
      color: 'negative',
    });

    return;
  }

  page.value.collab.doc.transact(() => {
    const layerId = region.value.react.collab.layerIds.splice(layerIndex, 1)[0];

    const layer = page.value.layers.fromId(layerId);

    if (layer != null) {
      page.value.deleting.deleteLayer(layer);
    }
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
    page.value.collab.doc.transact(() => {
      const layerId = v4();

      page.value.layers.react.collab[layerId] = ILayerCollab.parse({
        name,
      });

      region.value.react.collab.layerIds.splice(0, 0, layerId);
    });
  });
}
</script>

<style scoped>
.q-drawer-container:deep(.q-drawer__content) {
  display: flex;
  flex-direction: column;
}
</style>
