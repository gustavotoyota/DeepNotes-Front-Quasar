<template>
  <q-btn
    label="Change role"
    color="secondary"
    :disable="disable"
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
import { inject, Ref, ref, watch } from 'vue';

import { IGroupUser, initialSettings } from '../GroupSettingsDialog.vue';

const props = defineProps<{
  disable?: boolean;
  user: IGroupUser;
}>();

const visible = ref(false);

const page = inject<Ref<AppPage>>('page')!;

const roleId = ref<string | null>(null);

const settings = inject<Ref<ReturnType<typeof initialSettings>>>('settings')!;

watch(visible, async (value) => {
  if (!value) {
    return;
  }

  roleId.value = null;
});

async function changeRole() {
  if (roleId.value == null) {
    Notify.create({
      message: 'Please select a role',
      color: 'negative',
    });
    return;
  }

  await $api.post('/api/groups/change-role', {
    groupId: page.value.groupId,
    userId: props.user.id,
    roleId: roleId.value,
  });

  settings.value.members.list.find((user) => user === props.user)!.roleId =
    roleId.value;
}
</script>
