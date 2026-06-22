import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const TOKEN_KEY = 'ou-ssh-token';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => (localStorage.getItem(TOKEN_KEY) ? '/dashboard' : '/login')
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
    localStorage.setItem(TOKEN_KEY, tokenFromQuery);
  }

  const hasToken = Boolean(localStorage.getItem(TOKEN_KEY));

  if (to.meta.requiresAuth && !hasToken) {
    return { path: '/login' };
  }

  if (to.path === '/login' && hasToken) {
    return { path: '/dashboard' };
  }

  return true;
});

export default router;
