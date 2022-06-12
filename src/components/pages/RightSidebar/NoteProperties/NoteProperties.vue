<template>
  <q-list v-if="ui.rightSidebarMini">
    <MiniSidebarBtn
      tooltip="Head"
      icon="mdi-page-layout-header"
      :disable="page.react.readonly"
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
      :disable="page.react.readonly"
      @click="
        changeProp(true, (note, value) => {
          swapSyncedTexts(note.collab.head.value, note.collab.body.value);
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Body"
      icon="mdi-page-layout-body"
      :disable="page.react.readonly"
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
      :disable="page.react.readonly"
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
      :disable="page.react.readonly"
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
      :disable="page.react.readonly || !note.collab.collapsing.enabled"
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
      <Combobox
        label="Link URL"
        :disable="page.react.readonly"
        :options="
          $pages.react.recentPageIds.map((pageId) => ({
            label: $pages.react.pageTitles[pageId],
            value: pageId,
          }))
        "
        :model-value="note.collab.link"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.collab.link = value;
          })
        "
      >
        <template #item="scope">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{
              $pages.react.groupNames[
                $pages.react.dict[`pageGroupId.${scope.opt.value}`]
              ]
            }}</q-item-label>
          </q-item-section>
        </template>
      </Combobox>

      <Gap style="height: 16px" />

      <NewPageDialog />
    </div>

    <q-separator />

    <!-- Head and body -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Head"
          :disable="page.react.readonly"
          :model-value="note.collab.head.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.head.enabled = value;
              note.collab.body.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Body"
          :disable="page.react.readonly"
          :model-value="note.collab.body.enabled"
          @update:model-value="
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
          :disable="page.react.readonly"
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
          :disable="page.react.readonly"
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
          :disable="page.react.readonly"
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
          :disable="page.react.readonly"
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
        <Combobox
          label="Width"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'auto' }]"
          :model-value="note.collab.width[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.width[note.react.sizeProp] = value;
            })
          "
          style="flex: 1; min-width: 0"
        />

        <Gap style="width: 16px" />

        <Combobox
          label="Head height"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'auto' }]"
          :model-value="note.collab.head.height[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.head.height[note.react.sizeProp] = value;
            })
          "
          style="flex: 1; min-width: 0"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Combobox
          label="Body height"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'auto' }]"
          :model-value="note.collab.body.height[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.body.height[note.react.sizeProp] = value;
            })
          "
          style="flex: 1; min-width: 0"
        />

        <Gap style="width: 16px" />

        <Combobox
          label="Container height"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'auto' }]"
          :model-value="note.collab.container.height[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.height[note.react.sizeProp] = value;
            })
          "
          style="flex: 1; min-width: 0"
        />
      </div>
    </div>

    <q-separator />

    <div style="padding: 20px">
      <Checkbox
        label="Inherit color from parent"
        :disable="page.react.readonly"
        :model-value="note.collab.color.inherit"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.collab.color.inherit = value;
          })
        "
      />

      <Gap style="height: 16px" />

      <q-color
        :disable="page.react.readonly"
        :model-value="note.collab.color.value"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.collab.color.inherit = false;
            note.collab.color.value = value;
          })
        "
        default-view="palette"
        no-header
        no-header-tabs
        no-footer
        :palette="[
          '#424242', // grey-9
          '#b71c1c', // red-9
          '#ad1457', // pink-9
          '#6a1b9a', // purple-9
          '#4527a0', // deep-purple-9
          '#283593', // indigo-9
          '#1565c0', // blue-9
          '#0277BD', // light-blue-9
          '#00838F', // cyan-9
          '#00695C', // teal-9
          '#2E7D32', // green-9
          '#558B2F', // light-green-9
          '#9E9D24', // lime-9
          '#f57f17', // yellow-9
          '#FF6F00', // amber-9
          '#E65100', // orange-9
          '#BF360C', // deep-orange-9
          '#4E342E', // brown-9
          '#37474F', // blue-grey-9
        ]"
      />
    </div>

    <q-separator />

    <!-- Collapsing -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Collapsible"
          :disable="page.react.readonly"
          :model-value="note.collab.collapsing.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.collapsing.enabled = value;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Collapsed"
          :model-value="note.collab.collapsing.collapsed"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.collapsing.collapsed = value;
            })
          "
          :disable="page.react.readonly || !note.collab.collapsing.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Local collapsing"
          :model-value="note.collab.collapsing.localCollapsing"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.collapsing.localCollapsing = value;
            })
          "
          :disable="page.react.readonly || !note.collab.collapsing.enabled"
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Locally collapsed"
          :model-value="note.react.collapsing.locallyCollapsed"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collapsing.locallyCollapsed = value;
            })
          "
          :disable="
            page.react.readonly ||
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
          :disable="page.react.readonly"
          :model-value="note.collab.container.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.enabled = value;
              note.collab.body.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Horizontal"
          :model-value="note.collab.container.horizontal"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.horizontal = value;
            })
          "
          :disable="page.react.readonly || !note.collab.container.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Stretch children"
          :model-value="note.collab.container.stretchChildren"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.stretchChildren = value;
            })
          "
          :disable="page.react.readonly || !note.collab.container.enabled"
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Wrap children"
          :model-value="note.collab.container.wrapChildren"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.wrapChildren = value;
            })
          "
          :disable="page.react.readonly || !note.collab.container.enabled"
        />
      </div>

      <Gap style="height: 24px" />

      <q-btn
        label="Reverse children"
        :disable="page.react.readonly"
        color="primary"
        @click="
          changeProp($event, (note, value) => {
            note.reverseChildren();
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Movable"
        :disable="page.react.readonly"
        :model-value="note.collab.movable"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.collab.movable = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Resizable"
        :disable="page.react.readonly"
        :model-value="note.collab.resizable"
        @update:model-value="
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
        :disable="page.react.readonly"
        :model-value="note.collab.readOnly"
        @update:model-value="
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
import Combobox from '../../misc/Combobox.vue';
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
