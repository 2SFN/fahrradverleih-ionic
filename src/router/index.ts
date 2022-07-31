import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import StartupScreen from '@/views/StartupScreen.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: StartupScreen,
    alias: ['/login', '/register', '/welcome', '/auth']
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/map'
      },
      {
        path: 'map',
        component: () => import('@/views/TabMap.vue')
      },
      {
        path: 'ausleihen',
        component: () => import('@/views/TabAusleihen.vue')
      },
      {
        path: 'profil',
        component: () => import('@/views/TabProfil.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
