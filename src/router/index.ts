import { Cookies } from 'quasar';
import { route } from 'quasar/wrappers';
import { getRedirectDest } from 'src/code/app/routing';
import { useAuth } from 'src/stores/auth';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store, ssrContext }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  const auth = useAuth(store);
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

  let firstClientRoute = true;

  router.beforeEach(async (to) => {
    if (process.env.SERVER) {
      return;
    }

    if (firstClientRoute) {
      firstClientRoute = false;
      return;
    }

    // Check if needs to redirect

    const redirectDest = await getRedirectDest(to, auth, cookies);

    if (redirectDest != null) {
      console.log('redirectDest', redirectDest);

      return redirectDest;
    }

    // Setup page

    void globalThis.$pages?.setupPage(to.params.page_id as string);
  });

  return router;
});
