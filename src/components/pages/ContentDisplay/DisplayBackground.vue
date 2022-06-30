<template>
  <div
    class="display-background"
    @pointerdown.left="onLeftPointerDown"
    @dblclick.left="onLeftDoubleClick"
  ></div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/pages/app/page/page';
import { inject } from 'vue';

const page = inject<AppPage>('page')!;

function onLeftPointerDown(event: PointerEvent) {
  page.editing.stop();

  if (!event.ctrlKey && !event.shiftKey) {
    page.selection.clear(page);
  }

  page.boxSelection.start(event);
}

async function onLeftDoubleClick(event: MouseEvent) {
  const clientPos = page.pos.eventToClient(event);
  const worldPos = page.pos.clientToWorld(clientPos);

  await page.notes.create(page.react.activeLayer, worldPos);
}
</script>

<style scoped>
.display-background {
  position: absolute;

  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  background-color: #181818;
}
</style>
