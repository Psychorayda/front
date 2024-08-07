<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, RouteRecordRaw } from 'vue-router';
import {
    AntDesignOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons-vue';
import { ItemType, MenuProps } from 'ant-design-vue';

import { Log } from '../store/index';
import LoginModal from '../components/LoginModal.vue';
import LogoutModal from '../components/LogoutModal.vue';


const store = useStore();
const router = useRouter();

const showLoginModal = ref<boolean>(false);
const closeLoginModal = () => {
    showLoginModal.value = false;
};

const showLogoutModal = ref<boolean>(false);
const closeLogoutModal = () => {
    showLogoutModal.value = false;
};

const onOpenModal = () => {
    if (!store.getters.user.isLogedIn) {
        showLoginModal.value = true;
    } else {
        showLogoutModal.value = true;
    }
};

const userRoutes = computed(() =>
    store.getters.routes.filter((route: RouteRecordRaw) => route.path !== '/:catchAll(.*)')
);

const state = reactive({
    collapsed: false,
    preOpenKeys: [] as string[],
    rootSubmenuKeys: [] as string[],
    openKeys: [] as string[],
    selectedKeys: [] as string[],
});

function getItem(
    label: string,
    key: string,
    children?: ItemType[]
): ItemType {
    return {
        key,
        label,
        children,
    } as ItemType;
}

function generateMenuItems(routes: any[]): ItemType[] {
    return routes.map((route: any) => {
        if (route.children && route.children.length > 0) {
            return getItem(route.meta.title, route.path, generateMenuItems(route.children));
        }
        return getItem(route.meta.title, route.path);
    });
}

const menuItems = computed(() => generateMenuItems(userRoutes.value));

const onOpenChange = (openKeys: string[]) => {
    const latestOpenKey = openKeys.find(key => state.openKeys.indexOf(key) === -1);
    if (latestOpenKey) {
        if (state.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            state.openKeys = openKeys;
        } else {
            state.openKeys = latestOpenKey ? [latestOpenKey] : [];
        }
    }
};

const handleClick: MenuProps['onClick'] = e => {
    console.log('click', e);
    router.push(e.key as string);
};


watch(
    () => state.openKeys,
    (_val, oldVal) => {
        state.preOpenKeys = oldVal;
    },
);
const toggleCollapsed = () => {
    state.collapsed = !state.collapsed;
    state.openKeys = state.collapsed ? [] : state.preOpenKeys;
};

const currDevLog = computed<Log>(() => store.getters.currDevLog);
watch(currDevLog,
    () => {
        visible.value = true;
        // setTimeout(() => {
        //     visible.value = false;
        // }, 5000);
    }
);
const logMsg = computed<string>(() => `Time: ${currDevLog.value.time} - Device: ${currDevLog.value.deviceName}: - Message: ${currDevLog.value.message}`);
const visible = ref<boolean>(false);
const handleClose = () => {
    visible.value = false;
};

</script>

<template>
    <a-layout>
        <a-layout>
            <a-layout-header class="header">
                <div class="header-right">
                    <a-avatar size="large" @click="onOpenModal">
                        <template #icon>
                            <AntDesignOutlined />
                        </template>
                    </a-avatar>
                </div>
            </a-layout-header>
        </a-layout>
        <a-layout>
            <a-layout-sider width="200" style="background: #fff" :collapsed="state.collapsed">
                <a-menu v-model:openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys" mode="inline"
                    :items="menuItems" @openChange="onOpenChange" @click="handleClick"></a-menu>
                <div class="sider-bottom" :class="{ collapsed: state.collapsed }">
                    <a-button @click="toggleCollapsed">
                        <MenuUnfoldOutlined v-if="state.collapsed" />
                        <MenuFoldOutlined v-else />
                    </a-button>
                </div>
            </a-layout-sider>
            <a-layout style="padding: 24px 24px 0px">
                <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
                    <router-view />
                </a-layout-content>
                <LoginModal :open="showLoginModal" :onClose="closeLoginModal"></LoginModal>
                <LogoutModal :open="showLogoutModal" :on-close="closeLogoutModal"></LogoutModal>
            </a-layout>
        </a-layout>
        <a-layout>
            <a-layout-footer style="text-align: center">
                <a-space direction="vertical" style="width: 100%">
                    <a-alert v-if="visible" :message="logMsg" :type="currDevLog.level" closable
                        :after-close="handleClose" />
                </a-space>
            </a-layout-footer>
        </a-layout>
    </a-layout>
</template>

<style scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-right {
    margin-left: auto;
}

.sider-bottom {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: absolute;
    bottom: 16px;
    width: 100%;
}

.sider-bottom.collapsed {
    flex-direction: column;
    align-items: center;
}

.sider-bottom a-button {
    margin: 4px 0;
}

.sider-bottom a-switch {
    margin: 4px 0;
}
</style>
