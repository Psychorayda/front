import { createRouter, createWebHistory } from 'vue-router'


const routes = [
    {
        path: '/',
        component: () => import('../components/Home.vue'),
        meta: {
            title: 'Home',
            roles: ['user', 'admin']
        }
    },
    {
        path: '/device',
        component: () => import('../pages/DevicePage.vue'),
        meta: {
            title: 'Device',
            roles: ['admin']
        }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;