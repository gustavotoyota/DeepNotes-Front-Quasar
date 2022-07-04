<template>
  <q-header elevated>
    <q-toolbar
      class="bg-grey-10"
      style="padding: 0; justify-content: center; overflow: hidden"
    >
      <q-btn
        round
        style="
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          min-height: 50px;
          min-width: 50px;
        "
        class="bg-grey-9"
        @click="ui.toggleLeftSidebar()"
      >
        <q-icon
          style="position: relative; left: -2px"
          :name="ui.leftSidebarMini ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        />
      </q-btn>

      <div style="flex: 1; width: 0; display: flex; margin: 5px 0">
        <Gap style="width: 8px" />

        <div
          style="
            flex: 1;
            width: 0;
            display: flex;
            overflow: hidden;
            align-items: center;
            flex-wrap: wrap;
          "
        >
          <ToolbarBtn
            tooltip="Cut"
            icon="mdi-content-cut"
            :disable="page.react.readonly || !page.activeElem.react.exists"
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
            :disable="page.react.readonly"
            @click="page.clipboard.paste()"
          />
          <ToolbarBtn
            tooltip="Duplicate"
            icon="mdi-content-duplicate"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="page.cloning.perform()"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Undo"
            icon="mdi-undo"
            :disable="page.react.readonly || !page.undoRedo.react.canUndo"
            @click="page.undoRedo.undo()"
          />
          <ToolbarBtn
            tooltip="Redo"
            icon="mdi-redo"
            :disable="page.react.readonly || !page.undoRedo.react.canRedo"
            @click="page.undoRedo.redo()"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
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
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="page.deleting.perform()"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Bold"
            icon="mdi-format-bold"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleBold().run())"
          />
          <ToolbarBtn
            tooltip="Italic"
            icon="mdi-format-italic"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleItalic().run())"
          />
          <ToolbarBtn
            tooltip="Strike"
            icon="mdi-format-strikethrough"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleStrike().run())"
          />
          <ToolbarBtn
            tooltip="Strike"
            icon="mdi-format-underline"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleUnderline().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Align left"
            icon="mdi-format-align-left"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setTextAlign('left').run())"
          />
          <ToolbarBtn
            tooltip="Align center"
            icon="mdi-format-align-center"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setTextAlign('center').run())"
          />
          <ToolbarBtn
            tooltip="Align right"
            icon="mdi-format-align-right"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setTextAlign('right').run())"
          />
          <ToolbarBtn
            tooltip="Justify"
            icon="mdi-format-align-justify"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setTextAlign('justify').run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Header 1"
            icon="mdi-format-header-1"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setHeading({ level: 1 }).run())"
          />
          <ToolbarBtn
            tooltip="Header 2"
            icon="mdi-format-header-2"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setHeading({ level: 2 }).run())"
          />
          <ToolbarBtn
            tooltip="Header 3"
            icon="mdi-format-header-3"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.setHeading({ level: 3 }).run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Subscript"
            icon="mdi-format-subscript"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleSubscript().run())"
          />
          <ToolbarBtn
            tooltip="Superscript"
            icon="mdi-format-superscript"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleSuperscript().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Bullet list"
            icon="mdi-format-list-bulleted"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleBulletList().run())"
          />
          <ToolbarBtn
            tooltip="Ordered list"
            icon="mdi-format-list-numbered"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleOrderedList().run())"
          />
          <ToolbarBtn
            tooltip="Task list"
            icon="mdi-checkbox-marked-outline"
            icon-size="22px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleTaskList().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Blockquote"
            icon="mdi-format-quote-close"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleBlockquote().run())"
          />
          <ToolbarBtn
            tooltip="Code"
            icon="mdi-code-tags"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleCode().run())"
          />
          <ToolbarBtn
            tooltip="Codeblock"
            icon="mdi-code-braces"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.toggleCodeBlock().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Link"
            icon="mdi-link"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              Dialog.create({
                title: 'Insert link',
                message: 'URL:',
                prompt: {
                  model: '',
                },
                style: {
                  width: '300px',
                },
                cancel: true,
              }).onOk((url) => {
                format((chain) => chain.setLink({ href: url }).run());
              })
            "
          />
          <ToolbarBtn
            tooltip="Remove link"
            icon="mdi-link-off"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.unsetLink().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Clear formatting"
            icon="mdi-format-clear"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="format((chain) => chain.clearNodes().unsetAllMarks().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Rule"
            icon="mdi-minus"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.setHorizontalRule().run())"
          />

          <q-separator
            vertical
            style="margin: 6px 7px"
          />

          <ToolbarBtn
            tooltip="Insert table"
            icon="mdi-table-large-plus"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="
              format((chain) =>
                chain
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: false })
                  .run()
              )
            "
          />
          <ToolbarBtn
            tooltip="Remove table"
            icon="mdi-table-large-remove"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.deleteTable().run())"
          />
          <ToolbarBtn
            tooltip="Insert column before"
            icon="mdi-table-column-plus-before"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.addColumnBefore().run())"
          />
          <ToolbarBtn
            tooltip="Insert column after"
            icon="mdi-table-column-plus-after"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.addColumnAfter().run())"
          />
          <ToolbarBtn
            tooltip="Remove column"
            icon="mdi-table-column-remove"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.deleteColumn().run())"
          />
          <ToolbarBtn
            tooltip="Insert row before"
            icon="mdi-table-row-plus-before"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.addRowBefore().run())"
          />
          <ToolbarBtn
            tooltip="Insert row after"
            icon="mdi-table-row-plus-after"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.addRowAfter().run())"
          />
          <ToolbarBtn
            tooltip="Remove row"
            icon="mdi-table-row-remove"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.deleteRow().run())"
          />
          <ToolbarBtn
            tooltip="Merge cells"
            icon="mdi-table-merge-cells"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.mergeCells().run())"
          />
          <ToolbarBtn
            tooltip="Split cell"
            icon="mdi-table-split-cell"
            icon-size="23px"
            :disable="page.react.readonly || !page.editing.react.active"
            @click="format((chain) => chain.splitCell().run())"
          />
        </div>

        <Gap style="width: 6px" />

        <ToolbarBtn
          tooltip="Home"
          icon="mdi-home"
          icon-size="28px"
          round
          href="/"
        />

        <Gap style="width: 2px" />

        <ToolbarBtn
          tooltip="Notifications"
          icon="mdi-bell"
          icon-size="24px"
          round
        />

        <Gap style="width: 2px" />

        <UserSettingsDialog />

        <Gap style="width: 2px" />

        <ToolbarBtn
          tooltip="Account"
          icon="mdi-account-circle"
          icon-size="28px"
          round
        >
          <q-menu
            anchor="bottom right"
            self="top right"
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                href="/account/general"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-account" />
                </q-item-section>
                <q-item-section>Account</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="logout()"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </ToolbarBtn>

        <Gap style="width: 10px" />
      </div>

      <q-btn
        dense
        round
        style="
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          min-height: 50px;
          min-width: 50px;
        "
        class="bg-grey-9"
        @click="ui.toggleRightSidebar()"
      >
        <q-icon
          :name="ui.rightSidebarMini ? 'mdi-chevron-left' : 'mdi-chevron-right'"
          style="position: relative; right: -2px"
        />
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script
  setup
  lang="ts"
>
import type { ChainedCommands } from '@tiptap/vue-3';
import { computed } from '@vue/reactivity';
import { logout } from 'src/code/auth';
import { NoteTextSection } from 'src/code/pages/app/page/notes/note';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';

import ToolbarBtn from '../misc/ToolbarBtn.vue';
import UserSettingsDialog from './UserSettingsDialog/UserSettingsDialog.vue';

const ui = useUI();

const page = computed(() => $pages.react.page);

function format(func: (chain: ChainedCommands) => void) {
  if (page.value.editing.react.active) {
    const note = page.value.editing.react.note!;
    const section = page.value.editing.react.section!;

    const editor = note.react[section].editor;

    func(editor!.chain().focus());
  } else {
    for (const selectionNote of page.value.selection.react.notes) {
      for (const section of ['head', 'body'] as NoteTextSection[]) {
        const editor = selectionNote.react[section].editor;

        if (editor != null) {
          func(editor.chain().selectAll());
        }
      }
    }
  }
}
</script>

<style scoped>
.q-header {
  transition: left 0.2s ease, right 0.2s ease;
}
</style>
