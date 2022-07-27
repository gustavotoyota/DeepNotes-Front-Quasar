import { Cookies } from 'quasar';
import { internals } from 'src/code/app/internals';
import { Auth } from 'src/stores/auth';
import { RouteLocationNormalized } from 'vue-router';

export async function getRedirectDest(
  route: RouteLocationNormalized,
  auth: Auth,
  cookies: Cookies
): Promise<object | void> {
  if (auth.loggedIn && route.name === 'pages') {
    const response = await internals.api.post<{
      startingPageId: string;
    }>(
      '/api/users/starting-page-id',
      {},
      process.env.SERVER
        ? {
            headers: {
              cookie: Object.entries(cookies.getAll())
                .map(([name, value]) => `${name}=${value}`)
                .join(';'),
            },
          }
        : undefined
    );

    return { path: `/pages/${response.data.startingPageId}` };
  }

  if (
    auth.loggedIn &&
    route.matched.some((record) => record.meta.requiresGuest)
  ) {
    return { name: 'home' };
  }

  if (
    !auth.loggedIn &&
    route.matched.some((record) => record.meta.requiresAuth)
  ) {
    return { name: 'login' };
  }
}
