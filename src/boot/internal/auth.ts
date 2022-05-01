import { AxiosInstance } from 'axios';
import { Cookies } from 'quasar';
import { boot } from 'quasar/wrappers';
import {
  ACCESS_TOKEN_COOKIE,
  authEndpoints,
  REFRESH_TOKEN_COOKIE,
} from 'src/codes/auth';
import { useAuth } from 'src/stores/auth';

async function refreshTokens(
  cookies: Cookies,
  api: AxiosInstance
): Promise<boolean> {
  const response = await api.post(authEndpoints.refresh, {
    refreshToken: cookies.get(REFRESH_TOKEN_COOKIE),
  });

  if (response.status !== 200) {
    return false;
  }

  cookies.set(ACCESS_TOKEN_COOKIE, response.data.accessToken);
  cookies.set(REFRESH_TOKEN_COOKIE, response.data.refreshToken);

  return true;
}

export default boot(async ({ app, store, ssrContext }) => {
  if (process.env.CLIENT) {
    return;
  }

  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

  if (!cookies.has(ACCESS_TOKEN_COOKIE)) {
    return;
  }

  const api: AxiosInstance = app.config.globalProperties.$api;

  if (!(await refreshTokens(cookies, api))) {
    return;
  }

  const auth = useAuth(store);

  auth.loggedIn = true;
});
