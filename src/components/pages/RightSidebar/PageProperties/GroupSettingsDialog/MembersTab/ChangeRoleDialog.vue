<template>
  <slot :show-dialog="showDialog"></slot>

  <q-dialog v-model="visible">
    <q-card style="width: 300px">
      <q-form>
        <q-card-section style="padding: 12px">
          <div class="text-h6">Change role</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="padding: 21px">
          <q-select
            label="Role"
            :options="roles"
            option-label="name"
            option-value="id"
            filled
            emit-value
            map-options
            dense
            v-model="roleId"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <SmartBtn
            type="submit"
            flat
            label="Ok"
            color="primary"
            @click.prevent="changeRole()"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script
  setup
  lang="ts"
>
import { Notify } from 'quasar';
import { AppPage } from 'src/code/pages/page/page';
import { internals } from 'src/code/static/internals';
import { roles } from 'src/code/static/roles';
import SmartBtn from 'src/components/misc/SmartBtn.vue';
import { computed, inject, Ref, ref } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const roleId = ref<string | null>(null);

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.members.selectedIds);

function showDialog() {
  visible.value = true;

  roleId.value = null;
}

async function changeRole() {
  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role.',
      type: 'negative',
    });
    return;
  }

  try {
    await Promise.all(
      Array.from(selectedIds.value).map((userId) =>
        internals.api.post('/api/groups/change-user-role', {
          groupId: page.value.react.groupId,
          userId,
          roleId: roleId.value,
        })
      )
    );

    for (const user of settings.value.members.list) {
      if (selectedIds.value.has(user.userId)) {
        user.roleId = roleId.value;
      }
    }

    visible.value = false;
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      type: 'negative',
    });

    console.error(err);
  }
}
</script>
