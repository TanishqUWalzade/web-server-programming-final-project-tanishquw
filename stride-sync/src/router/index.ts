import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ActivitiesView from '@/views/ActivitiesView.vue'
import FriendsView from '@/views/FriendsView.vue'
import AdminUsersView from '@/views/AdminUsersView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/activities',
      name: 'activities',
      component: ActivitiesView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn && to.path !== '/') {
    return '/'
  }

  if (to.path === '/' && authStore.isLoggedIn) {
    return '/dashboard'
  }

  if (to.path === '/admin/users' && !authStore.isAdmin) {
    return '/dashboard'
  }

  return true
})

export default router