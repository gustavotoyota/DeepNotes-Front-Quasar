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
    let response;

    if (process.env.SERVER) {
      let cookieHeader = '';
      for (const [name, value] of Object.entries(cookies.getAll())) {
        cookieHeader += `${name}=${value}; `;
      }

      response = await internals.api.post<{
        startingPageId: string;
      }>(
        '/api/users/starting-page-id',
        {},
        {
          headers: { cookie: cookieHeader },
        }
      );
    } else {
      response = await internals.api.post<{
        startingPageId: string;
      }>('/api/users/starting-page-id');
    }

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
