import { createRouter, createWebHistory } from 'vue-router'

import store from '../store/index';
import { Role } from '../store/index';


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
            roles: ['admin'],
        }
    },
    {
        path: '/add',
        component: () => import('../pages/DeviceAddPage.vue'),
        meta: {
            title: 'Add',
            roles: ['admin'],
        },
        children: [
            {
                path: '1',
                component: () => import('../pages/DeviceAddPage1.vue'),
                meta: {
                    title: 'Add1',
                    roles: ['admin'],
                },
            },
        ]
    },
    {
        path: '/:catchAll(.*)',
        component: () => import('../components/About.vue'),
        meta: {
            title: 'NotFound',
        },
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})


router.beforeEach((to, from, next) => {
    const userRoles = store.getters.user.roles.map((role: Role) => role.name);

    function hasPermission(route: any): boolean {
        if (Array.isArray(route.meta.roles)) {
            return route.meta.roles.some((role: string) => userRoles.includes(role));
        }
        return true;
    }

    if (to.path === '/' || to.matched.every(hasPermission)) {
        next();
    } else {
        next({ path: '/not-found' });
    }
});


export default router;