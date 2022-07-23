import { Auth } from 'src/stores/auth';
import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  Router,
} from 'vue-router';

export function getRedirect(
  route: RouteLocationNormalized,
  auth: Auth
): RouteLocationRaw | void {
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

export function enforceRouteRules(
  auth: Auth,
  route: RouteLocationNormalizedLoaded,
  router: Router
): boolean {
  if (process.env.SERVER) {
    return false;
  }

  const redirect = getRedirect(route, auth);

  if (redirect == null) {
    return false;
  }

  void router.push(redirect);

  return true;
}
