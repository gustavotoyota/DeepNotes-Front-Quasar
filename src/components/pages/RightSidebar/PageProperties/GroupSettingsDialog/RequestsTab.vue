<template>
  <div style="display: contents">
    <div style="display: flex">
      <q-btn
        label="Select all"
        color="primary"
      />

      <Gap style="width: 16px" />

      <q-btn
        label="Clear selection"
        color="primary"
      />
    </div>

    <Gap style="height: 16px" />

    <div style="flex: 1; height: 0; display: flex">
      <div style="flex: 1">
        <q-list
          style="
            border-radius: 10px;
            max-height: 100%;
            padding: 0;
            overflow-y: auto;
          "
        >
          <q-item
            v-for="user in settings.members.list"
            :key="user.id"
            class="text-grey-1"
            style="background-color: #424242"
            clickable
            v-ripple
            active-class="bg-grey-7"
            :active="settings.members.selectedIds.has(user.id)"
          >
            <q-item-section>
              {{ $pages.realtime.get('userName', user.id) }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div
        style="
          flex: none;
          margin-left: 16px;
          width: 200px;
          display: flex;
          flex-direction: column;
        "
      ></div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import Gap from 'src/components/misc/Gap.vue';
import { inject, Ref } from 'vue';

import { initialSettings } from './GroupSettingsDialog.vue';

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;
</script>
