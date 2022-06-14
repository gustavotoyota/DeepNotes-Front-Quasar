<template>
  <q-btn
    label="Change role"
    color="secondary"
    :disable="selectedIds.size === 0"
    @click="visible = true"
  />

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
          <q-btn
            type="submit"
            flat
            label="Ok"
            color="primary"
            v-close-popup
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
import { AppPage } from 'src/code/pages/app/page/page';
import { roles } from 'src/code/pages/static/roles';
import { computed, inject, Ref, ref, watch } from 'vue';

import { initialSettings } from '../GroupSettingsDialog.vue';

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const roleId = ref<string | null>(null);

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

const selectedIds = computed(() => settings.value.members.selectedIds);

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  roleId.value = null;
});

async function changeRole() {
  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role.',
      color: 'negative',
    });
    return;
  }

  try {
    await Promise.all(
      Array.from(selectedIds.value).map((userId) =>
        $api.post('/api/groups/change-user-role', {
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
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);
  }
}
</script>
