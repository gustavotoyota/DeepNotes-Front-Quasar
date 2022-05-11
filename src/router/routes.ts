import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/HomeLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/home/Index.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('src/layouts/HomeLayout.vue'),
    children: [{ path: '', component: () => import('pages/home/Login.vue') }],
  },
  {
    path: '/register',
    component: () => import('src/layouts/HomeLayout.vue'),
    children: [
      { path: '', component: () => import('pages/home/Register.vue') },
    ],
  },
  {
    path: '/account',
    component: () => import('src/layouts/HomeLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/home/Account.vue'),
        children: [
          {
            path: 'general',
            component: () => import('pages/home/Account/General.vue'),
          },
          {
            path: 'security',
            component: () => import('pages/home/Account/Security.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/pages',
    component: () => import('src/layouts/PagesLayout.vue'),
    children: [{ path: '', component: () => import('pages/pages/Index.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
