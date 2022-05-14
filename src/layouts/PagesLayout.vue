<template>
  <q-layout
    class="pages-layout"
    view="lHr lpR fFf"
  >
    <template v-if="$pages.react.page != null">
      <MainToolbar />

      <LeftSidebar />
      <RightSidebar />
    </template>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <loading-overlay v-if="!$pages.react.mounted" />
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/pages/app/page/notes/note';
import { factory } from 'src/code/pages/static/composition-root';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import LeftSidebar from 'src/components/pages/LeftSidebar.vue';
import MainToolbar from 'src/components/pages/MainToolbar.vue';
import RightSidebar from 'src/components/pages/RightSidebar/RightSidebar.vue';
import { useApp } from 'src/stores/app';
import { getCurrentInstance, onBeforeUnmount, onMounted, toRef } from 'vue';
import { useRoute } from 'vue-router';

const app = useApp();
const route = useRoute();

const $pages = factory.makeApp();
globalThis.$pages = $pages;
getCurrentInstance()!.appContext.config.globalProperties.$pages = $pages;
const page = toRef($pages.react, 'page');

// Initialize pages app

onMounted(async () => {
  await app.ready;

  await $pages.loadData(route.params.page_id as string);

  $pages.react.mounted = true;
});

// Release pointer down for touchscreen

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDownCapture, true);
});
function onPointerDownCapture(event: PointerEvent) {
  (event.target as Element).releasePointerCapture(event.pointerId);
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDownCapture, true);
});

// Shortcuts

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keypress', onKeyPress);
});

function onKeyDown(event: KeyboardEvent) {
  if (
    (event.target as HTMLElement).isContentEditable &&
    event.code === 'Escape'
  ) {
    page.value.editing.stop();
  }

  if (event.ctrlKey && event.code === 'KeyD') {
    event.preventDefault();
  }

  if (
    (event.target as HTMLElement).nodeName === 'INPUT' ||
    (event.target as HTMLElement).nodeName === 'TEXTAREA' ||
    (event.target as HTMLElement).isContentEditable
  ) {
    return;
  }

  if (event.code === 'Delete') {
    page.value.deleting.perform();
  }

  if (event.ctrlKey && event.code === 'KeyA') {
    page.value.selection.selectAll();
  }

  if (event.ctrlKey && event.code === 'KeyD') {
    page.value.cloning.perform();
  }

  if (event.ctrlKey && event.code === 'KeyC') {
    page.value.clipboard.copy();
  }
  if (event.ctrlKey && event.code === 'KeyV' && window.clipboardData) {
    page.value.clipboard.paste();
  }
  if (event.ctrlKey && event.code === 'KeyX') {
    page.value.clipboard.cut();
  }

  if (event.ctrlKey && event.code === 'KeyZ') {
    //page.value.undoRedo.undo()
  }
  if (event.ctrlKey && event.code === 'KeyY') {
    //page.value.undoRedo.redo()
  }

  if (
    event.code === 'F2' &&
    page.value.activeElem.react.elem instanceof PageNote
  ) {
    page.value.editing.start(page.value.activeElem.react.elem);
  }

  if (event.code === 'ArrowLeft') {
    page.value.selection.shift(-1, 0);
  }
  if (event.code === 'ArrowRight') {
    page.value.selection.shift(1, 0);
  }
  if (event.code === 'ArrowUp') {
    page.value.selection.shift(0, -1);
  }
  if (event.code === 'ArrowDown') {
    page.value.selection.shift(0, 1);
  }
}
function onKeyPress(event: KeyboardEvent) {
  if (
    (event.target as HTMLElement).nodeName === 'INPUT' ||
    (event.target as HTMLElement).nodeName === 'TEXTAREA' ||
    (event.target as HTMLElement).isContentEditable
  )
    return;

  if (page.value.activeElem.react.elem instanceof PageNote) {
    page.value.editing.start(page.value.activeElem.react.elem);
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keypress', onKeyPress);
  document.removeEventListener('keydown', onKeyDown);
});

// Clipboard pasting

onMounted(() => {
  document.addEventListener('paste', onPaste);
});

function onPaste(event: ClipboardEvent) {
  if (
    (event.target as HTMLElement).nodeName === 'INPUT' ||
    (event.target as HTMLElement).nodeName === 'TEXTAREA' ||
    (event.target as HTMLElement).isContentEditable
  )
    return;

  const text = (event.clipboardData || window.clipboardData).getData('text');

  page.value.clipboard.paste(text);
}

onBeforeUnmount(() => {
  document.removeEventListener('paste', onPaste);
});
</script>

<style scoped>
.pages-layout :deep(*) {
  touch-action: pan-x pan-y;
}
.pages-layout :deep(*:not(input)) {
  user-select: none;
}

.pages-layout :deep(.q-tooltip) {
  font-size: 12px;
}

.pages-layout :deep(.q-drawer) {
  transition: width 0.2s ease;
  overflow-x: hidden;
}
.pages-layout :deep(.q-drawer__content) {
  overflow-x: hidden;
}
.pages-layout :deep(.q-drawer:not(.q-drawer--mini) .q-drawer__content) {
  width: 299px !important;
}
.pages-layout :deep(.q-drawer.q-drawer--mini .q-item) {
  justify-content: normal !important;
  padding-left: 16px !important;
}
.pages-layout :deep(.q-drawer .q-item) {
  justify-content: normal !important;
  padding-left: 16px !important;
}

.pages-layout :deep(.q-page-container) {
  transition: padding-left 0.2s ease, padding-right 0.2s ease;
}

/* Scrollbars */

.pages-layout :deep(::-webkit-scrollbar) {
  width: 15px;
}
.pages-layout :deep(::-webkit-scrollbar-track) {
  background: #202020;
}
.pages-layout :deep(::-webkit-scrollbar-thumb) {
  background: #303030;
  border: solid 1px #404040;
}
.pages-layout :deep(::-webkit-scrollbar-thumb:hover) {
  background: #404040;
}
</style>
