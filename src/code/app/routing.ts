import { Auth } from 'src/stores/auth';
import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  Router,
} from 'vue-router';

export function getRedirectDest(
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

  const redirectDest = getRedirectDest(route, auth);

  if (redirectDest == null) {
    return false;
  }

  void router.push(redirectDest);

  return true;
}
