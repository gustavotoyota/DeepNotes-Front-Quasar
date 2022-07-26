import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/HomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/home/Index.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('src/layouts/HomeLayout.vue'),
    meta: {
      requiresGuest: true,
    },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('src/pages/home/Login.vue'),
      },
    ],
  },
  {
    path: '/register',
    component: () => import('src/layouts/HomeLayout.vue'),
    meta: {
      requiresGuest: true,
    },
    children: [
      {
        path: '',
        name: 'register',
        component: () => import('src/pages/home/Register.vue'),
      },
    ],
  },
  {
    path: '/finish-registration',
    component: () => import('src/layouts/HomeLayout.vue'),
    meta: {
      requiresGuest: true,
    },
    children: [
      {
        path: '',
        name: 'finish-registration',
        component: () => import('src/pages/home/FinishRegistration.vue'),
      },
    ],
  },
  {
    path: '/email-verification/:code',
    component: () => import('src/layouts/HomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'email-verification',
        component: () => import('src/pages/home/EmailVerification.vue'),
      },
    ],
  },
  {
    path: '/account',
    component: () => import('src/layouts/HomeLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('src/pages/home/Account.vue'),
        children: [
          {
            path: 'general',
            name: 'account-general',
            component: () => import('src/pages/home/Account/General.vue'),
          },
          {
            path: 'security',
            name: 'account-security',
            component: () =>
              import('src/pages/home/Account/Security/Security.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/pages',
    name: 'pages',
    component: () => import('src/pages/pages/Pages.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/pages/:page_id',
    component: () => import('src/layouts/PagesLayout.vue'),
    children: [
      {
        path: '',
        name: 'page',
        component: () => import('src/pages/pages/Page.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
];

export default routes;
