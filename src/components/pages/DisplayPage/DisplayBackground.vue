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
import { AppPage } from 'src/code/app/pages/page/page';
import { inject } from 'vue';

const page = inject<AppPage>('page')!;

function onLeftPointerDown(event: PointerEvent) {
  page.editing.stop();

  if (!event.ctrlKey && !event.shiftKey) {
    page.selection.clear(page);
  }

  page.boxSelection.start(event, page);
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

  inset: 0;
}
</style>
