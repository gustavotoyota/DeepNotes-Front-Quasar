import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { Cookies } from 'quasar';
import { boot } from 'quasar/wrappers';
import {
  ACCESS_TOKEN_COOKIE,
  authEndpoints,
  REFRESH_TOKEN_COOKIE,
} from 'src/codes/auth';
import { useAuth } from 'src/stores/auth';

function isTokenValid(cookie: string): boolean {
  if (cookie == null) {
    return false;
  }

  const decodedToken = jwtDecode<{ exp: number }>(cookie);

  return new Date().getTime() < decodedToken.exp * 1000;
}
function areTokensValid(cookies: Cookies): boolean {
  return (
    isTokenValid(cookies.get(ACCESS_TOKEN_COOKIE)) &&
    isTokenValid(cookies.get(REFRESH_TOKEN_COOKIE))
  );
}

function isTokenExpiring(cookie: string): boolean {
  if (cookie == null) {
    return false;
  }

  const decodedToken = jwtDecode<{ exp: number; iat: number }>(cookie);

  const timeToLive = decodedToken.exp * 1000 - decodedToken.iat * 1000;
  const timeDifference = decodedToken.exp * 1000 - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}
function areTokensExpiring(cookies: Cookies): boolean {
  return (
    isTokenExpiring(cookies.get(ACCESS_TOKEN_COOKIE)) ||
    isTokenExpiring(cookies.get(REFRESH_TOKEN_COOKIE))
  );
}

async function tryRefreshTokens(
  cookies: Cookies,
  api: AxiosInstance
): Promise<boolean> {
  const auth = useAuth();

  if (!areTokensValid(cookies)) {
    return (auth.loggedIn = false);
  }

  if (!areTokensExpiring(cookies)) {
    return (auth.loggedIn = true);
  }

  try {
    const response = await api.post(authEndpoints.refresh, {
      refreshToken: cookies.get(REFRESH_TOKEN_COOKIE),
    });

    cookies.set(ACCESS_TOKEN_COOKIE, response.data.accessToken);
    cookies.set(REFRESH_TOKEN_COOKIE, response.data.refreshToken);

    return (auth.loggedIn = true);
  } catch {
    return (auth.loggedIn = false);
  }
}

export default boot(async ({ app, ssrContext }) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

  const api: AxiosInstance = app.config.globalProperties.$api;

  await tryRefreshTokens(cookies, api);

  if (process.env.CLIENT) {
    setInterval(() => {
      tryRefreshTokens(cookies, api);
    }, 10000);
  }
});
