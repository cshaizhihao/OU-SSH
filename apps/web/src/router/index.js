import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import { readSessionToken, writeSessionToken } from '../services/api.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => (readSessionToken() ? '/dashboard' : '/login')
    },
    {
      path: '/login',
      component: LoginView
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

router.beforeEach((to) => {
  const tokenFromQuery = typeof to.query.token === 'string' ? to.query.token : '';

  if (tokenFromQuery) {
    writeSessionToken(tokenFromQuery);
  }

  const hasToken = Boolean(readSessionToken());

  if (to.meta.requiresAuth && !hasToken) {
    return { path: '/login' };
  }

  if (to.path === '/login' && hasToken) {
    return { path: '/dashboard' };
  }

  return true;
});

export default router;
