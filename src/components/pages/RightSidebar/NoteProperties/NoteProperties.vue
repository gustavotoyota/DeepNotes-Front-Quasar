<template>
  <q-list v-if="ui.rightSidebarMini">
    <MiniSidebarBtn
      tooltip="Head"
      icon="mdi-page-layout-header"
      :active="note.collab.head.enabled"
      @click="
        changeProp(!note.collab.head.enabled, (note, value) => {
          note.collab.head.enabled = value;
          note.collab.body.enabled ||= note.react.numEnabledSections === 0;
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Swap head and body"
      icon="mdi-swap-vertical"
      @click="
        changeProp(true, (note, value) => {
          swapSyncedTexts(note.collab.head.value, note.collab.body.value);
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Body"
      icon="mdi-page-layout-body"
      :active="note.collab.body.enabled"
      @click="
        changeProp(!note.collab.body.enabled, (note, value) => {
          note.collab.body.enabled = value;
          note.collab.head.enabled ||= note.react.numEnabledSections === 0;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Container"
      icon="mdi-page-layout-footer"
      :active="note.collab.container.enabled"
      @click="
        changeProp(!note.collab.container.enabled, (note, value) => {
          note.collab.container.enabled = value;
          note.collab.body.enabled ||= note.react.numEnabledSections === 0;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Collapsible"
      icon="mdi-minus-box"
      :active="note.collab.collapsing.enabled"
      @click="
        changeProp(!note.collab.collapsing.enabled, (note, value) => {
          note.collab.collapsing.enabled = value;
        })
      "
    />

    <MiniSidebarBtn
      :tooltip="note.react.collapsing.collapsed ? 'Expand' : 'Collapse'"
      :icon="
        note.react.collapsing.collapsed
          ? 'mdi-chevron-down-box-outline'
          : 'mdi-chevron-up-box-outline'
      "
      :active="note.react.collapsing.collapsed"
      :disabled="!note.collab.collapsing.enabled"
      @click="
        changeProp(!note.react.collapsing.collapsed, (note, value) => {
          note.react.collapsing.collapsed = value;
        })
      "
    />
  </q-list>

  <div v-else>
    <!-- Link -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <q-select
        label="Link URL"
        :options="
          $pages.react.recentPageIds.map((pageId) => ({
            label: $pages.realtime.get('pageTitle', pageId),
            value: pageId,
            groupId: $pages.react.dict[`groupId.${pageId}`],
            ownerId: $pages.react.dict[`ownerId.${pageId}`],
          }))
        "
        emit-value
        v-model="note.collab.link"
        @input-value="note.collab.link = $event"
        use-input
        filled
        dense
        hide-selected
        fill-input
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{
                $pages.realtime.get('groupName', scope.opt.groupId) ||
                (scope.opt.ownerId
                  ? `${$pages.realtime.get(
                      'userName',
                      scope.opt.ownerId
                    )}'s Group`
                  : '') ||
                ''
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <Gap style="height: 16px" />

      <NewPageDialog />
    </div>

    <q-separator />

    <!-- Head and body -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Head"
          :value="note.collab.head.enabled"
          @input="
            changeProp($event, (note, value) => {
              note.collab.head.enabled = value;
              note.collab.body.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Body"
          :value="note.collab.body.enabled"
          @input="
            changeProp($event, (note, value) => {
              note.collab.body.enabled = value;
              note.collab.head.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <q-btn
          label="Swap"
          color="primary"
          dense
          style="flex: 1"
          @click="
            changeProp(note, (note, value) => {
              swapSyncedTexts(note.collab.head.value, note.collab.body.value);
            })
          "
        />

        <Gap style="width: 16px" />

        <q-btn
          label="Float"
          color="primary"
          dense
          style="flex: 1"
          @click="
            changeProp(note, (note, value) => {
              if (note.collab.head.value.length <= 1) {
                swapSyncedTexts(note.collab.head.value, note.collab.body.value);
              }
            })
          "
        />
      </div>
    </div>

    <q-separator />

    <!-- Template -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <SaveAsTemplateDialog />
    </div>

    <q-separator />

    <!-- Anchor -->

    <div style="padding: 20px; display: flex">
      <div style="flex: 1">
        <q-select
          label="X anchor"
          :model-value="note.collab.anchor.x"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.pos.x +=
                (value - note.collab.anchor.x) * note.react.worldSize.x;
              note.collab.anchor.x = value;
            })
          "
          :options="[
            { label: 'Left', value: 0 },
            { label: 'Center', value: 0.5 },
            { label: 'Right', value: 1 },
          ]"
          filled
          dense
          emit-value
          map-options
        />
      </div>

      <Gap style="width: 16px" />

      <div style="flex: 1">
        <q-select
          label="Y anchor"
          :model-value="note.collab.anchor.y"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.pos.y +=
                (value - note.collab.anchor.y) * note.react.worldSize.y;
              note.collab.anchor.y = value;
            })
          "
          :options="[
            { label: 'Top', value: 0 },
            { label: 'Center', value: 0.5 },
            { label: 'Bottom', value: 1 },
          ]"
          filled
          dense
          emit-value
          map-options
        />
      </div>
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <q-select
          label="Width"
          :options="[{ label: 'Auto', value: 'auto' }]"
          v-model="note.collab.width[note.react.sizeProp]"
          @input-value="note.collab.width[note.react.sizeProp] = $event"
          filled
          dense
          use-input
          fill-input
          hide-selected
          emit-value
          style="flex: 1; min-width: 0"
        />

        <Gap style="width: 16px" />

        <q-select
          label="Head height"
          :options="[{ label: 'Auto', value: 'auto' }]"
          emit-value
          v-model="note.collab.head.height[note.react.sizeProp]"
          @input-value="note.collab.head.height[note.react.sizeProp] = $event"
          use-input
          filled
          dense
          hide-selected
          fill-input
          style="flex: 1; min-width: 0"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <q-select
          label="Body height"
          :options="[{ label: 'Auto', value: 'auto' }]"
          emit-value
          v-model="note.collab.body.height[note.react.sizeProp]"
          @input-value="note.collab.body.height[note.react.sizeProp] = $event"
          use-input
          filled
          dense
          hide-selected
          fill-input
          style="flex: 1; min-width: 0"
        />

        <Gap style="width: 16px" />

        <q-select
          label="Container height"
          :options="[{ label: 'Auto', value: 'auto' }]"
          emit-value
          v-model="note.collab.container.height[note.react.sizeProp]"
          @input-value="
            note.collab.container.height[note.react.sizeProp] = $event
          "
          use-input
          filled
          dense
          hide-selected
          fill-input
          style="flex: 1; min-width: 0"
        />
      </div>
    </div>

    <q-separator />

    <!-- Collapsing -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Collapsible"
          :value="note.collab.collapsing.enabled"
          @input="
            changeProp($event, (note, value) => {
              note.collab.collapsing.enabled = value;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Collapsed"
          :value="note.collab.collapsing.collapsed"
          @input="
            changeProp($event, (note, value) => {
              note.collab.collapsing.collapsed = value;
            })
          "
          :disable="!note.collab.collapsing.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Local collapsing"
          :value="note.collab.collapsing.localCollapsing"
          @input="
            changeProp($event, (note, value) => {
              note.collab.collapsing.localCollapsing = value;
            })
          "
          :disable="!note.collab.collapsing.enabled"
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Locally collapsed"
          :value="note.react.collapsing.locallyCollapsed"
          @input="
            changeProp($event, (note, value) => {
              note.react.collapsing.locallyCollapsed = value;
            })
          "
          :disable="
            !note.collab.collapsing.enabled ||
            !note.collab.collapsing.localCollapsing
          "
        />
      </div>
    </div>

    <q-separator />

    <!-- Container -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Container"
          :value="note.collab.container.enabled"
          @input="
            changeProp($event, (note, value) => {
              note.collab.container.enabled = value;
              note.collab.body.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Horizontal"
          :value="note.collab.container.horizontal"
          @input="
            changeProp($event, (note, value) => {
              note.collab.container.horizontal = value;
            })
          "
          :disable="!note.collab.container.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Stretch children"
          :value="note.collab.container.stretchChildren"
          @input="
            changeProp($event, (note, value) => {
              note.collab.container.stretchChildren = value;
            })
          "
          :disable="!note.collab.container.enabled"
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Wrap children"
          :value="note.collab.container.wrapChildren"
          @input="
            changeProp($event, (note, value) => {
              note.collab.container.wrapChildren = value;
            })
          "
          :disable="!note.collab.container.enabled"
        />
      </div>
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Movable"
        :value="note.collab.movable"
        @input="
          changeProp($event, (note, value) => {
            note.collab.movable = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Resizable"
        :value="note.collab.resizable"
        @input="
          changeProp($event, (note, value) => {
            note.collab.resizable = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Read-only"
        :value="note.collab.readOnly"
        @input="
          changeProp($event, (note, value) => {
            note.collab.readOnly = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <div style="flex: 1"></div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { AppPage } from 'src/code/pages/app/page/page';
import { swapSyncedTexts } from 'src/code/pages/static/synced-store';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { inject, Ref, toRef } from 'vue';

import Checkbox from '../../misc/Checkbox.vue';
import MiniSidebarBtn from '../../misc/MiniSidebarBtn.vue';
import NewPageDialog from './NewPageDialog.vue';
import SaveAsTemplateDialog from './SaveAsTemplateDialog.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const note = toRef(page.value.activeElem.react, 'elem') as Ref<PageNote>;

function changeProp(value: any, func: (note: PageNote, value: any) => void) {
  page.value.collab.doc.transact(() => {
    for (const note of page.value.selection.react.notes) {
      func(note, value);
    }
  });
}
</script>
