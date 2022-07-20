<template>
  <q-page style="min-height: initial">
    <ResponsiveContainer style="margin: 150px auto">
      <div style="margin: 0px auto; max-width: 270px">
        <q-form>
          <q-input
            label="E-mail"
            filled
            label-color="grey-5"
            v-model="data.email"
          />

          <Gap style="height: 12px" />

          <PasswordField
            label="Password"
            v-model="data.password"
          />

          <Gap style="height: 16px" />

          <Checkbox
            label="Remember e-mail"
            v-model="data.rememberEmail"
          />

          <Gap style="height: 16px" />

          <q-btn
            label="Login"
            type="submit"
            color="primary"
            :loading="data.loading"
            style="width: 100%; font-size: 16px; padding: 12px 0px"
            @click.prevent="onSubmit()"
          />
        </q-form>

        <Gap style="height: 16px" />

        <div style="text-align: center">
          Not registered yet?
          <router-link
            to="/register"
            style="color: #29b6f6"
          >
            Sign up
          </router-link>
        </div>
      </div>
    </ResponsiveContainer>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import { Notify } from 'quasar';
import { login } from 'src/code/auth';
import Gap from 'src/components/misc/Gap.vue';
import ResponsiveContainer from 'src/components/misc/ResponsiveContainer.vue';
import Checkbox from 'src/components/pages/misc/Checkbox.vue';
import PasswordField from 'src/components/pages/misc/PasswordField.vue';
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const data = reactive({
  email: '',
  password: '',

  rememberEmail: false,

  loading: false,
});

onMounted(() => {
  data.email = localStorage.getItem('email') ?? '';
  data.rememberEmail = data.email !== '';
});

async function onSubmit() {
  try {
    data.loading = true;

    // Store e-mail

    if (data.rememberEmail) {
      localStorage.setItem('email', data.email);
    } else {
      localStorage.removeItem('email');
    }

    // Login

    await login(data.email, data.password);

    Notify.create({
      message: 'Login successful.',
      color: 'positive',
    });

    await router.push('/pages');
  } catch (err: any) {
    Notify.create({
      message: err.response?.data.message ?? 'An error has occurred.',
      color: 'negative',
    });

    console.error(err);

    data.loading = false;
  }
}
</script>
