<template>
  <div
    class="d-block d-md-none"
    style="position: absolute; inset: 0; pointer-events: none"
  >
    <div
      style="
        position: absolute;
        left: 60px;
        top: 8px;
        pointer-events: none;
        display: flex;
      "
    >
      <DisplayBtn icon="mdi-hammer-wrench">
        <q-menu
          style="padding: 1px 5px"
          :offset="[0, 4]"
        >
          <div>
            <ToolbarBtn
              tooltip="Cut"
              icon="mdi-content-cut"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.clipboard.cut()"
            />
            <ToolbarBtn
              tooltip="Copy"
              icon="mdi-content-copy"
              :disable="!page.activeElem.react.exists"
              @click="page.clipboard.copy()"
            />
            <ToolbarBtn
              tooltip="Paste"
              icon="mdi-content-paste"
              :disable="page.react.groupReadOnly"
              @click="page.clipboard.paste()"
            />
            <ToolbarBtn
              tooltip="Duplicate"
              icon="mdi-content-duplicate"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.cloning.perform()"
            />
          </div>

          <div>
            <ToolbarBtn
              tooltip="Undo"
              icon="mdi-undo"
              :disable="
                page.react.groupReadOnly || !page.undoRedo.react.canUndo
              "
              @click="page.undoRedo.undo()"
            />
            <ToolbarBtn
              tooltip="Redo"
              icon="mdi-redo"
              :disable="
                page.react.groupReadOnly || !page.undoRedo.react.canRedo
              "
              @click="page.undoRedo.redo()"
            />

            <ToolbarBtn
              tooltip="Select all"
              icon="mdi-select-all"
              icon-size="24px"
              @click="page.selection.selectAll()"
            />
            <ToolbarBtn
              tooltip="Delete"
              icon="mdi-delete-outline"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.deleting.perform()"
            />
          </div>
        </q-menu>
      </DisplayBtn>

      <Gap style="width: 4px" />

      <DisplayBtn icon="mdi-format-color-text">
        <q-menu
          style="padding: 1px 5px"
          :offset="[0, 4]"
        >
          <div>
            <ToolbarBtn
              tooltip="Bold"
              icon="mdi-format-bold"
              icon-size="25px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('bold')"
            />
            <ToolbarBtn
              tooltip="Italic"
              icon="mdi-format-italic"
              icon-size="25px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('italic')"
            />
            <ToolbarBtn
              tooltip="Strike"
              icon="mdi-format-strikethrough"
              icon-size="25px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('strike')"
            />
            <ToolbarBtn
              tooltip="Underline"
              icon="mdi-format-underline"
              icon-size="25px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('underline')"
            />
          </div>

          <div>
            <ToolbarBtn
              tooltip="Align left"
              icon="mdi-format-align-left"
              icon-size="21px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setTextAlign('left'))
              "
            />
            <ToolbarBtn
              tooltip="Align center"
              icon="mdi-format-align-center"
              icon-size="21px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setTextAlign('center'))
              "
            />
            <ToolbarBtn
              tooltip="Align right"
              icon="mdi-format-align-right"
              icon-size="21px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setTextAlign('right'))
              "
            />
            <ToolbarBtn
              tooltip="Justify"
              icon="mdi-format-align-justify"
              icon-size="21px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setTextAlign('justify'))
              "
            />
          </div>

          <div style="display: flex">
            <ToolbarBtn
              tooltip="Subscript"
              icon="mdi-format-subscript"
              icon-size="23px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('subscript')"
            />
            <ToolbarBtn
              tooltip="Superscript"
              icon="mdi-format-superscript"
              icon-size="23px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('superscript')"
            />
            <ToolbarBtn
              tooltip="Link"
              icon="mdi-link"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                Dialog.create({
                  title: 'Insert link',
                  message: 'URL:',
                  color: 'primary',
                  prompt: {
                    model: '',
                    filled: true,
                  },
                  style: {
                    width: '300px',
                  },
                  cancel: true,
                }).onOk((url) => {
                  page.selection.setMark('link', { href: url });
                })
              "
            />
            <ToolbarBtn
              tooltip="Remove link"
              icon="mdi-link-off"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.unsetMark('link')"
            />
          </div>

          <div>
            <ToolbarBtn
              tooltip="Header 1"
              icon="mdi-format-header-1"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setHeading({ level: 1 }))
              "
            />
            <ToolbarBtn
              tooltip="Header 2"
              icon="mdi-format-header-2"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setHeading({ level: 2 }))
              "
            />
            <ToolbarBtn
              tooltip="Header 3"
              icon="mdi-format-header-3"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.setHeading({ level: 3 }))
              "
            />
            <ToolbarBtn
              tooltip="Clear formatting"
              icon="mdi-format-clear"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) =>
                  chain.clearNodes().unsetAllMarks()
                )
              "
            />
          </div>
        </q-menu>
      </DisplayBtn>

      <Gap style="width: 4px" />

      <DisplayBtn icon="mdi-format-list-bulleted">
        <q-menu
          style="padding: 1px 5px"
          :offset="[0, 4]"
        >
          <div>
            <ToolbarBtn
              tooltip="Bullet list"
              icon="mdi-format-list-bulleted"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.toggleBulletList())
              "
            />
            <ToolbarBtn
              tooltip="Ordered list"
              icon="mdi-format-list-numbered"
              icon-size="24px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.toggleOrderedList())
              "
            />
            <ToolbarBtn
              tooltip="Task list"
              icon="mdi-checkbox-marked-outline"
              icon-size="22px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.format((chain) => chain.toggleTaskList())"
            />
          </div>

          <div>
            <ToolbarBtn
              tooltip="Blockquote"
              icon="mdi-format-quote-close"
              icon-size="23px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="
                page.selection.format((chain) => chain.toggleBlockquote())
              "
            />
            <ToolbarBtn
              tooltip="Code"
              icon="mdi-code-tags"
              icon-size="23px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.toggleMark('code')"
            />
            <ToolbarBtn
              tooltip="Codeblock"
              icon="mdi-code-braces"
              icon-size="23px"
              :disable="
                page.react.groupReadOnly || !page.activeElem.react.exists
              "
              @click="page.selection.format((chain) => chain.toggleCodeBlock())"
            />
            <ToolbarBtn
              tooltip="Rule"
              icon="mdi-minus"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="
                page.selection.format((chain) => chain.setHorizontalRule())
              "
            />
          </div>

          <div>
            <ToolbarBtn
              tooltip="Insert table"
              icon="mdi-table-large-plus"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="
                page.selection.format((chain) =>
                  chain.insertTable({ rows: 3, cols: 3, withHeaderRow: false })
                )
              "
            />
            <ToolbarBtn
              tooltip="Remove table"
              icon="mdi-table-large-remove"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.deleteTable())"
            />
            <ToolbarBtn
              tooltip="Insert column before"
              icon="mdi-table-column-plus-before"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.addColumnBefore())"
            />
            <ToolbarBtn
              tooltip="Insert column after"
              icon="mdi-table-column-plus-after"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.addColumnAfter())"
            />
            <ToolbarBtn
              tooltip="Remove column"
              icon="mdi-table-column-remove"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.deleteColumn())"
            />
          </div>

          <div>
            <ToolbarBtn
              tooltip="Merge cells"
              icon="mdi-table-merge-cells"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.mergeCells())"
            />
            <ToolbarBtn
              tooltip="Split cell"
              icon="mdi-table-split-cell"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.splitCell())"
            />
            <ToolbarBtn
              tooltip="Insert row before"
              icon="mdi-table-row-plus-before"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.addRowBefore())"
            />
            <ToolbarBtn
              tooltip="Insert row after"
              icon="mdi-table-row-plus-after"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.addRowAfter())"
            />
            <ToolbarBtn
              tooltip="Remove row"
              icon="mdi-table-row-remove"
              icon-size="23px"
              :disable="page.react.groupReadOnly || !page.editing.react.active"
              @click="page.selection.format((chain) => chain.deleteRow())"
            />
          </div>
        </q-menu>
      </DisplayBtn>
    </div>

    <DisplayBtn
      icon="mdi-account"
      style="position: absolute; right: 60px; top: 8px"
    >
      <q-menu
        anchor="bottom right"
        self="top right"
        auto-close
      >
        <q-list>
          <q-item
            clickable
            href="/"
          >
            <q-item-section avatar>
              <q-icon name="mdi-home" />
            </q-item-section>
            <q-item-section>Home</q-item-section>
          </q-item>
          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="mdi-bell" />
            </q-item-section>
            <q-item-section>Notifications</q-item-section>
          </q-item>
          <q-item
            clickable
            @click="internals.showUserSettingsDialog()"
          >
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>
          <q-item
            clickable
            href="/account/general"
          >
            <q-item-section avatar>
              <q-icon name="mdi-account" />
            </q-item-section>
            <q-item-section>Account</q-item-section>
          </q-item>
          <q-item
            clickable
            @click="logout()"
          >
            <q-item-section avatar>
              <q-icon name="mdi-logout" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </DisplayBtn>

    <q-btn
      v-if="!ui.rightSidebarExpanded || ui.leftSidebarVisible"
      round
      style="
        position: absolute;
        left: 0px;
        top: 0px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        min-height: 50px;
        min-width: 50px;
        pointer-events: auto;
      "
      class="bg-grey-9"
      @click="ui.toggleLeftSidebar()"
    >
      <q-icon
        style="position: relative; left: -2px"
        :name="
          ui.leftSidebarExpanded ? 'mdi-chevron-left' : 'mdi-chevron-right'
        "
      />
    </q-btn>

    <q-btn
      v-if="!ui.leftSidebarExpanded || ui.rightSidebarVisible"
      dense
      round
      style="
        position: absolute;
        right: 0px;
        top: 0px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        min-height: 50px;
        min-width: 50px;
        pointer-events: auto;
      "
      class="bg-grey-9"
      @click="ui.toggleRightSidebar()"
    >
      <q-icon
        :name="
          ui.rightSidebarExpanded ? 'mdi-chevron-right' : 'mdi-chevron-left'
        "
        style="position: relative; right: -2px"
      />
    </q-btn>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { logout } from 'src/code/app/auth';
import DisplayBtn from 'src/components/misc/DisplayBtn.vue';
import Gap from 'src/components/misc/Gap.vue';
import ToolbarBtn from 'src/components/misc/ToolbarBtn.vue';
import { useUI } from 'src/stores/ui';
import { computed } from 'vue';

const ui = useUI();

const page = computed(() => $pages.react.page);
</script>
