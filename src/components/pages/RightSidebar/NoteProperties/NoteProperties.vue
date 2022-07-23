<template>
  <q-list v-if="!ui.rightSidebarExpanded">
    <MiniSidebarBtn
      tooltip="Head"
      icon="mdi-page-layout-header"
      :disable="page.react.readonly"
      :active="note.react.collab.head.enabled"
      @click="
        changeProp(!note.react.collab.head.enabled, (note, value) => {
          note.react.collab.head.enabled = value;
          note.react.collab.body.enabled ||=
            note.react.numEnabledSections === 0;
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Swap head and body"
      icon="mdi-swap-vertical"
      :disable="page.react.readonly"
      @click="
        changeProp(null, (note) => {
          internals.tiptap.swapXmlFragments(
            note.react.collab.head.value,
            note.react.collab.body.value
          );
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Body"
      icon="mdi-page-layout-body"
      :disable="page.react.readonly"
      :active="note.react.collab.body.enabled"
      @click="
        changeProp(!note.react.collab.body.enabled, (note, value) => {
          note.react.collab.body.enabled = value;
          note.react.collab.head.enabled ||=
            note.react.numEnabledSections === 0;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Container"
      icon="mdi-page-layout-footer"
      :disable="page.react.readonly"
      :active="note.react.collab.container.enabled"
      @click="
        changeProp(!note.react.collab.container.enabled, (note, value) => {
          note.react.collab.container.enabled = value;
          note.react.collab.body.enabled ||=
            note.react.numEnabledSections === 0;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Collapsible"
      icon="mdi-minus-box"
      :disable="page.react.readonly"
      :active="note.react.collab.collapsing.enabled"
      @click="
        changeProp(!note.react.collab.collapsing.enabled, (note, value) => {
          note.react.collab.collapsing.enabled = value;
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
      :disable="page.react.readonly || !note.react.collab.collapsing.enabled"
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
        :model-value="note.react.collab.link"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.link = value;
          })
        "
      >
        <template #item="scope">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{
              $pages.react.groupNames[
                $pages.react.dict[`${DICT_PAGE_GROUP_ID}:${scope.opt.value}`]
              ]
            }}</q-item-label>
          </q-item-section>
        </template>
      </Combobox>

      <Gap style="height: 16px" />

      <NewPageDialog>
        <template #default="{ showDialog }">
          <q-btn
            label="Create new page"
            color="primary"
            :disable="page.react.readonly"
            @click="showDialog()"
          />
        </template>
      </NewPageDialog>
    </div>

    <q-separator />

    <!-- Head and body -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Head"
          :disable="page.react.readonly"
          :model-value="note.react.collab.head.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.head.enabled = value;
              note.react.collab.body.enabled ||=
                note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Body"
          :disable="page.react.readonly"
          :model-value="note.react.collab.body.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.body.enabled = value;
              note.react.collab.head.enabled ||=
                note.react.numEnabledSections === 0;
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
            changeProp(null, (note) => {
              internals.tiptap.swapXmlFragments(
                note.react.collab.head.value,
                note.react.collab.body.value
              );
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
            changeProp(note, (note) => {
              if (note.react.collab.head.value.toDOM().textContent!.length === 0) {
                internals.tiptap.swapXmlFragments(
                  note.react.collab.head.value,
                  note.react.collab.body.value
                );
              }
            })
          "
        />
      </div>
    </div>

    <q-separator />

    <!-- Default -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <q-btn
        label="Set as default"
        color="primary"
        @click="setAsDefault()"
      />
    </div>

    <q-separator />

    <!-- Anchor -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div class="display: flex">
        <div style="flex: 1">
          <q-input
            label="X position"
            :model-value="note.react.collab.pos.x"
            @update:model-value="
              changeProp(parseFloat($event as any), (note, value) => {
                note.react.collab.pos.x = value;
              })
            "
            filled
            dense
          />
        </div>

        <Gap style="width: 16px" />

        <div style="flex: 1">
          <q-input
            label="Y position"
            :model-value="note.react.collab.pos.y"
            @update:model-value="
              changeProp(parseFloat($event as any), (note, value) => {
                note.react.collab.pos.y = value;
              })
            "
            filled
            dense
          />
        </div>
      </div>

      <Gap style="height: 16px" />

      <div class="display: flex">
        <div style="flex: 1">
          <q-select
            label="X anchor"
            :disable="page.react.readonly"
            :model-value="note.react.collab.anchor.x"
            @update:model-value="
              changeProp($event, (note, value) => {
                note.react.collab.pos.x +=
                  (value - note.react.collab.anchor.x) * note.react.worldSize.x;
                note.react.collab.anchor.x = value;
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
            :model-value="note.react.collab.anchor.y"
            @update:model-value="
              changeProp($event, (note, value) => {
                note.react.collab.pos.y +=
                  (value - note.react.collab.anchor.y) * note.react.worldSize.y;
                note.react.collab.anchor.y = value;
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
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Combobox
          label="Width"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'Auto' }]"
          :model-value="note.react.collab.width[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.width[note.react.sizeProp] = value;
            })
          "
          style="flex: 1; min-width: 0"
        />

        <Gap style="width: 16px" />

        <Combobox
          label="Head height"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'Auto' }]"
          :model-value="note.react.collab.head.height[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.head.height[note.react.sizeProp] = value;
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
          :options="[{ label: 'Auto', value: 'Auto' }]"
          :model-value="note.react.collab.body.height[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.body.height[note.react.sizeProp] = value;
            })
          "
          style="flex: 1; min-width: 0"
        />

        <Gap style="width: 16px" />

        <Combobox
          label="Container height"
          :disable="page.react.readonly"
          :options="[{ label: 'Auto', value: 'Auto' }]"
          :model-value="note.react.collab.container.height[note.react.sizeProp]"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.container.height[note.react.sizeProp] = value;
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
        :model-value="note.react.collab.color.inherit"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.color.inherit = value;
          })
        "
      />

      <Gap style="height: 16px" />

      <q-color
        :disable="page.react.readonly"
        :model-value="note.react.collab.color.value"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.color.inherit = false;
            note.react.collab.color.value = value;
          })
        "
        default-view="palette"
        no-header
        no-header-tabs
        no-footer
        :palette="[
          '#424242', // grey
          '#455A64', // blue-grey
          '#5D4037', // brown
          '#E64A19', // deep-orange
          '#F57C00', // orange
          '#FFA000', // amber
          '#FBC02D', // yellow
          '#AFB42B', // lime
          '#689F38', // light-green
          '#388E3C', // green
          '#00796B', // teal
          '#0097A7', // cyan
          '#0288D1', // light-blue
          '#1976D2', // blue
          '#303F9F', // indigo
          '#512DA8', // deep-purple
          '#7B1FA2', // purple
          '#C2185B', // pink
          '#D32F2F', // red
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
          :model-value="note.react.collab.collapsing.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.collapsing.enabled = value;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Collapsed"
          :model-value="note.react.collab.collapsing.collapsed"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.collapsing.collapsed = value;
            })
          "
          :disable="
            page.react.readonly || !note.react.collab.collapsing.enabled
          "
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Local collapsing"
          :model-value="note.react.collab.collapsing.localCollapsing"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.collapsing.localCollapsing = value;
            })
          "
          :disable="
            page.react.readonly || !note.react.collab.collapsing.enabled
          "
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
            !note.react.collab.collapsing.enabled ||
            !note.react.collab.collapsing.localCollapsing
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
          :model-value="note.react.collab.container.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.container.enabled = value;
              note.react.collab.body.enabled ||=
                note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Spatial"
          :model-value="note.react.collab.container.spatial"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.container.spatial = value;
            })
          "
          :disable="page.react.readonly || !note.react.collab.container.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Horizontal"
          :model-value="note.react.collab.container.horizontal"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.container.horizontal = value;
            })
          "
          :disable="
            page.react.readonly ||
            !note.react.collab.container.enabled ||
            note.react.collab.container.spatial
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Stretch children"
          :model-value="note.react.collab.container.stretchChildren"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collab.container.stretchChildren = value;
            })
          "
          :disable="
            page.react.readonly ||
            !note.react.collab.container.enabled ||
            note.react.collab.container.horizontal ||
            note.react.collab.container.spatial
          "
        />
      </div>

      <Gap style="height: 16px" />

      <Checkbox
        label="Wrap children"
        :model-value="note.react.collab.container.wrapChildren"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.container.wrapChildren = value;
          })
        "
        :disable="
          page.react.readonly ||
          !note.react.collab.container.enabled ||
          note.react.collab.container.spatial
        "
      />

      <Gap style="height: 24px" />

      <q-btn
        label="Reverse children"
        :disable="page.react.readonly || !note.react.collab.container.enabled"
        color="primary"
        @click="
          changeProp($event, (note, value) => {
            note.react.activeLayer.reverseChildren();
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Movable"
        :disable="page.react.readonly"
        :model-value="note.react.collab.movable"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.movable = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Resizable"
        :disable="page.react.readonly"
        :model-value="note.react.collab.resizable"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.resizable = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Wrap head"
        :disable="page.react.readonly"
        :model-value="note.react.collab.head.wrap"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.head.wrap = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Wrap body"
        :disable="page.react.readonly"
        :model-value="note.react.collab.body.wrap"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.body.wrap = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Read-only"
        :disable="page.react.readonly"
        :model-value="note.react.collab.readOnly"
        @update:model-value="
          changeProp($event, (note, value) => {
            note.react.collab.readOnly = value;
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
import sodium from 'libsodium-wrappers';
import { Notify } from 'quasar';
import { internals } from 'src/code/app/internals';
import { PageNote } from 'src/code/app/pages/page/notes/note';
import { AppPage } from 'src/code/app/pages/page/page';
import { DICT_PAGE_GROUP_ID } from 'src/code/app/pages/pages';
import { encodeText } from 'src/code/lib/text';
import Checkbox from 'src/components/misc/Checkbox.vue';
import Combobox from 'src/components/misc/Combobox.vue';
import Gap from 'src/components/misc/Gap.vue';
import MiniSidebarBtn from 'src/components/misc/MiniSidebarBtn.vue';
import { useUI } from 'src/stores/pages/ui';
import { computed } from 'vue';
import { inject, Ref } from 'vue';

import NewPageDialog from './NewPageDialog.vue';

const ui = useUI();

const page = inject<Ref<AppPage>>('page')!;

const note = computed(() => page.value.activeElem.react.elem as PageNote);

function changeProp(value: any, func: (note: PageNote, value: any) => void) {
  page.value.collab.doc.transact(() => {
    for (const selectedNote of page.value.selection.react.validNotes) {
      func(selectedNote, value);
    }
  });
}

async function setAsDefault() {
  $pages.react.defaultNote = $pages.serialization.serialize({
    noteIds: [$pages.react.page.activeElem.react.id!],
    arrowIds: [],
  });

  try {
    await internals.api.post<{
      templateId: string;
    }>('/api/users/save-default-note', {
      encryptedDefaultNote: sodium.to_base64(
        $pages.react.symmetricKey.encrypt(
          encodeText(JSON.stringify($pages.react.defaultNote))
        )
      ),
    });

    Notify.create({
      message: 'Default note set.',
      type: 'positive',
    });
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
}
</script>
