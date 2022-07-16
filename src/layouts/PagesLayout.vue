<template>
  <q-layout
    class="pages-layout"
    view="lHr lpR fFf"
  >
    <template v-if="mounted">
      <MainToolbar />

      <LeftSidebar />
      <RightSidebar />
    </template>

    <q-page-container>
      <q-page>
        <DisplayPage
          v-for="page in globalThis.$pages?.pageCache.react.cache"
          :key="page.id"
          :page="page"
          :style="{
            visibility: page === $pages.react.page ? undefined : 'hidden',
          }"
        />

        <DisplayBtns />

        <DisplayMobileBtns />

        <UserSettingsDialog v-if="mounted" />
      </q-page>
    </q-page-container>
  </q-layout>

  <LoadingOverlay v-if="!mounted" />

  <TableContextMenu v-if="mounted" />
</template>

<script
  setup
  lang="ts"
>
import { useMeta } from 'quasar';
import { AppPage } from 'src/code/pages/app/page/page';
import { factory } from 'src/code/pages/static/composition-root';
import { isDetachedDOM } from 'src/code/pages/static/dom';
import {
  BREAKPOINT_LG_MIN,
  BREAKPOINT_SM_MIN,
} from 'src/code/pages/static/responsive';
import { Vec2 } from 'src/code/pages/static/vec2';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';
import DisplayBtns from 'src/components/pages/DisplayPage/DisplayBtns.vue';
import DisplayMobileBtns from 'src/components/pages/DisplayPage/DisplayMobileBtns.vue';
import DisplayPage from 'src/components/pages/DisplayPage/DisplayPage.vue';
import LeftSidebar from 'src/components/pages/LeftSidebar/LeftSidebar.vue';
import MainToolbar from 'src/components/pages/MainToolbar/MainToolbar.vue';
import RightSidebar from 'src/components/pages/RightSidebar/RightSidebar.vue';
import UserSettingsDialog from 'src/components/pages/UserSettingsDialog/UserSettingsDialog.vue';
import { useApp } from 'src/stores/app';
import { useUI } from 'src/stores/pages/ui';
import { computed } from 'vue';
import {
  ComputedRef,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import TableContextMenu from '../components/pages/TableContextMenu.vue';

const app = useApp();
const route = useRoute();
const router = useRouter();
const ui = useUI();

const mounted = ref(false);

let page: ComputedRef<AppPage>;

if (process.env.CLIENT) {
  globalThis.$pages = factory.makeApp();
  getCurrentInstance()!.appContext.config.globalProperties.$pages = $pages;

  page = computed(() => $pages.react.page);
}

useMeta(() => {
  let title = 'DeepNotes';

  if (page?.value?.react.groupName) {
    title = `${page.value.react.groupName} - ${title}`;
  }

  if (page?.value?.react.title) {
    title = `${page.value.react.title} - ${title}`;
  }

  return { title };
});

// Pages application

onMounted(async () => {
  await app.ready;

  await Promise.all([
    $pages.loadData(),

    $pages.setupPage(route.params.page_id as string),
  ]);

  mounted.value = true;
});

// Release pointer capture for touchscreen

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDownCapture, true);
});
function onPointerDownCapture(event: PointerEvent) {
  (event.target as Element).releasePointerCapture(event.pointerId);
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDownCapture, true);
});

// KeyDown shortcuts

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
});

async function onKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.code === 'KeyD') {
    event.preventDefault();
  }

  if (page.value == null) {
    return;
  }

  // If currently editing a note

  const target = event.target as HTMLElement;

  if (
    target.nodeName === 'INPUT' ||
    target.nodeName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    if (event.code === 'Escape') {
      page.value.editing.stop();
      return;
    }

    return;
  }

  // If there is an element selected

  const activeElem = page.value.activeElem.react.elem;

  if (activeElem != null) {
    if (event.code === 'F2') {
      await page.value.editing.start(activeElem);
      return;
    }

    if (event.code === 'Backspace') {
      await page.value.editing.start(activeElem);

      activeElem.react.editor?.commands.deleteSelection();

      return;
    }

    if (event.ctrlKey && event.code === 'KeyB') {
      page.value.selection.toggleMark('bold');
      return;
    }
    if (event.ctrlKey && event.code === 'KeyI') {
      page.value.selection.toggleMark('italic');
      return;
    }
    if (event.ctrlKey && event.code === 'KeyU') {
      page.value.selection.toggleMark('underline');
      return;
    }
    if (event.ctrlKey && event.code === 'KeyE') {
      page.value.selection.toggleMark('code');
      return;
    }
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyX') {
      page.value.selection.toggleMark('strike');
      return;
    }
  }

  if (event.code === 'Delete') {
    page.value.deleting.perform();
    return;
  }

  if (event.ctrlKey && event.code === 'KeyA') {
    page.value.selection.selectAll();
    return;
  }

  if (event.ctrlKey && event.code === 'KeyD') {
    await page.value.cloning.perform();
    return;
  }

  if (event.ctrlKey && event.code === 'KeyC') {
    await page.value.clipboard.copy();
    return;
  }
  if (event.ctrlKey && event.code === 'KeyV' && window.clipboardData) {
    await page.value.clipboard.paste();
    return;
  }
  if (event.ctrlKey && event.code === 'KeyX') {
    await page.value.clipboard.cut();
    return;
  }

  if (event.ctrlKey && event.code === 'KeyZ') {
    page.value.undoRedo.undo();
    return;
  }
  if (event.ctrlKey && event.code === 'KeyY') {
    page.value.undoRedo.redo();
    return;
  }

  if (event.code === 'ArrowLeft') {
    page.value.selection.shift(new Vec2(-1, 0));
    return;
  }
  if (event.code === 'ArrowRight') {
    page.value.selection.shift(new Vec2(1, 0));
    return;
  }
  if (event.code === 'ArrowUp') {
    page.value.selection.shift(new Vec2(0, -1));
    return;
  }
  if (event.code === 'ArrowDown') {
    page.value.selection.shift(new Vec2(0, 1));
    return;
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown);
});

// KeyPress shortcut

onMounted(() => {
  document.addEventListener('keypress', onKeyPress);
});

async function onKeyPress(event: KeyboardEvent) {
  if (event.ctrlKey) {
    return;
  }

  if (page.value == null) {
    return;
  }

  const target = event.target as HTMLElement;

  if (
    target.nodeName === 'INPUT' ||
    target.nodeName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  const activeElem = page.value.activeElem.react.elem;

  if (activeElem != null) {
    await page.value.editing.start(activeElem);

    if (activeElem.react.editor == null) {
      return;
    }

    let chain = activeElem.react.editor.chain().deleteSelection();

    if (event.key === 'Enter') {
      chain = chain.insertContent('<p></p><p></p>');
    } else {
      chain = chain.insertContent(event.key);
    }

    chain.run();
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keypress', onKeyPress);
});

// Clipboard pasting

onMounted(() => {
  document.addEventListener('paste', onPaste, {
    capture: true,
  });
});

async function onPaste(event: ClipboardEvent) {
  const target = event.target as HTMLElement;

  // Pasting local images

  const editorElem = target.closest('.ProseMirror');

  if (editorElem != null && (event.clipboardData?.files?.length ?? 0) > 0) {
    for (const file of Array.from(event.clipboardData!.files)) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const reader = new FileReader();

      reader.addEventListener('loadend', (event) => {
        page.value.selection.format((chain) =>
          chain.setImage({
            src: event.target!.result as string,
          })
        );
      });

      reader.readAsDataURL(file);
    }

    event.preventDefault();

    return;
  }

  // Pasting elements into document

  if (
    target.nodeName === 'INPUT' ||
    target.nodeName === 'TEXTAREA' ||
    target.isContentEditable ||
    editorElem != null ||
    isDetachedDOM(target)
  ) {
    return;
  }

  const text = (event.clipboardData || window.clipboardData).getData('text');

  await page.value.clipboard.paste(text);
}

onBeforeUnmount(() => {
  document.removeEventListener('paste', onPaste);
});

// Intercept internal page navigation

onMounted(() => {
  document.addEventListener('click', onClick);
});

async function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  const anchor = target.closest('a[href]');

  if (anchor == null) {
    return;
  }

  const href = anchor.getAttribute('href') ?? '';

  if (
    (href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('/')) &&
    !href.startsWith('/pages/') &&
    !href.startsWith(`${window.location.origin}/pages/`)
  ) {
    return; // Allow default if it's not a page link
  }

  event.preventDefault(); // Prevent default navigation

  if (event.altKey || target.isContentEditable) {
    return;
  }

  const pageId = href.split('/').at(-1) ?? '';

  await $pages.goToPage(pageId, router, true);
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onClick);
});

// Context menu

onMounted(() => {
  document.addEventListener('contextmenu', onContextMenu);
});

function onContextMenu(event: MouseEvent) {
  let elem = event.target as HTMLElement | null;

  if (!elem?.isContentEditable) {
    return;
  }

  while (elem != null) {
    if (elem.nodeName === 'TD' || elem.nodeName === 'TH') {
      event.preventDefault();

      $pages.react.tableContextMenu = true;
      $pages.react.tableContextMenuPos = new Vec2(
        Math.min(event.clientX, document.body.clientWidth - 400),
        Math.min(event.clientY, document.body.clientHeight - 192)
      );

      return;
    }

    elem = elem.parentElement;
  }

  $pages.react.tableContextMenu = false;
}

onBeforeUnmount(() => {
  document.removeEventListener('contextmenu', onContextMenu);
});

// Resize

onMounted(() => {
  onResize();

  window.addEventListener('resize', onResize);
});

function onResize() {
  ui.leftSidebarVisible = window.innerWidth >= BREAKPOINT_SM_MIN;
  ui.rightSidebarVisible = window.innerWidth >= BREAKPOINT_SM_MIN;

  if (
    window.innerWidth < BREAKPOINT_LG_MIN &&
    ui.leftSidebarExpanded &&
    ui.rightSidebarExpanded
  ) {
    ui.rightSidebarExpanded = false;
  }

  ui.width = window.innerWidth;
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});
</script>

<style>
* {
  user-select: none;
}

body {
  overscroll-behavior-y: contain; /* Prevent pull-to-refresh */
}
</style>

<style
  lang="scss"
  scoped
>
.pages-layout {
  :deep(.q-drawer) {
    transition: width 0.2s ease;
    overflow-x: hidden;
  }
  :deep(.q-drawer__content) {
    overflow-x: hidden;
  }
  :deep(.q-drawer:not(.q-drawer--mini) .q-drawer__content) {
    width: 299px !important;
  }
  :deep(.q-drawer.q-drawer--mini .q-item) {
    justify-content: normal !important;
    padding-left: 16px !important;
  }
  :deep(.q-drawer .q-item) {
    justify-content: normal !important;
    padding-left: 16px !important;
  }

  :deep(.q-page-container) {
    transition: padding-left 0.2s ease, padding-right 0.2s ease;
  }

  /* Scrollbars */

  :deep(::-webkit-scrollbar) {
    width: 15px;
  }
  :deep(::-webkit-scrollbar-track) {
    background: #202020;
  }
  :deep(::-webkit-scrollbar-thumb) {
    background: #303030;
    border: solid 1px #404040;
  }
  :deep(::-webkit-scrollbar-thumb:hover) {
    background: #404040;
  }
}
</style>
