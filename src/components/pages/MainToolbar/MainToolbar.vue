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

      <div style="flex: 1; width: 0; display: flex">
        <div
          style="
            flex: 1;
            width: 0;
            display: flex;
            overflow: hidden;
            align-items: center;
          "
        >
          <Gap style="width: 8px" />

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
            style="margin: 0 7px"
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
            style="margin: 0 7px"
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
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Bold"
            icon="mdi-format-bold"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.toggleBold().run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Italic"
            icon="mdi-format-italic"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.toggleItalic().run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Strike"
            icon="mdi-format-strikethrough"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.toggleStrike().run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Strike"
            icon="mdi-format-underline"
            icon-size="25px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.toggleUnderline().run();
              })
            "
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Align left"
            icon="mdi-format-align-left"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setTextAlign('left').run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Align center"
            icon="mdi-format-align-center"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setTextAlign('center').run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Align right"
            icon="mdi-format-align-right"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setTextAlign('right').run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Justify"
            icon="mdi-format-align-justify"
            icon-size="21px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setTextAlign('justify').run();
              })
            "
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Header 1"
            icon="mdi-format-header-1"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setHeading({ level: 1 }).run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Header 2"
            icon="mdi-format-header-2"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setHeading({ level: 2 }).run();
              })
            "
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Bullet list"
            icon="mdi-format-list-bulleted"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.toggleBulletList().run();
              })
            "
          />
          <ToolbarBtn
            tooltip="Ordered list"
            icon="mdi-format-list-numbered"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.toggleOrderedList().run();
              })
            "
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Table"
            icon="mdi-table-large"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: false })
                  .run();
              })
            "
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Rule"
            icon="mdi-minus"
            icon-size="23px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.setHorizontalRule().run();
              })
            "
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Clear formatting"
            icon="mdi-format-clear"
            icon-size="24px"
            :disable="page.react.readonly || !page.activeElem.react.exists"
            @click="
              format((chain) => {
                chain.clearNodes().unsetAllMarks().run();
              })
            "
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
import { ChainedCommands } from '@tiptap/vue-3';
import { logout } from 'src/code/auth';
import { NoteTextSection } from 'src/code/pages/app/page/notes/note';
import Gap from 'src/components/misc/Gap.vue';
import { useUI } from 'src/stores/pages/ui';
import { toRef } from 'vue';

import ToolbarBtn from '../misc/ToolbarBtn.vue';
import UserSettingsDialog from './UserSettingsDialog/UserSettingsDialog.vue';

const ui = useUI();

const page = toRef($pages.react, 'page');

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
