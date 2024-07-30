<template>
    <a-layout>
        <a-layout-header class="header">
            <div class="header-right">
                <a-avatar size="large" @click="openLoginModal">
                    <template #icon>
                        <AntDesignOutlined />
                    </template>
                </a-avatar>
            </div>
        </a-layout-header>
        <a-layout>
            <a-layout-sider theme="light">
                <a-menu
                    id="sider-menu"
                    v-model:openKeys="openKeys"
                    v-model:selectedKeys="selectedKeys"
                    style="width: 256px"
                    mode="inline"
                    :items="items"
                    @click="handleClick"
                ></a-menu>
            </a-layout-sider>
            <a-layout-content>
                <router-view />
            </a-layout-content>
            <a-layout-footer>Footer</a-layout-footer>
            <LoginModal :open="showLoginModal" :onClose="closeLoginModal"></LoginModal>
        </a-layout>
    </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, h, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { AntDesignOutlined, MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import type { MenuProps, ItemType } from 'ant-design-vue';
import LoginModal from '../components/LoginModal.vue';

const showLoginModal = ref<boolean>(false);
const openLoginModal = () => {
    showLoginModal.value = true;
};
const closeLoginModal = () => {
    showLoginModal.value = false;
};

const store = useStore();
const router = useRouter();

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

function getItem(
  label: string,
  key: string,
  icon?: any,
  children?: ItemType[],
  type?: 'group',
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as ItemType;
}

function routeToMenuItem(route) {
  return getItem(route.meta.title, route.path, route.meta.icon ? () => h(route.meta.icon) : null);
}

const items: ItemType[] = reactive([]);

const filteredRoutes = store.getters.filteredRoutes;
filteredRoutes.forEach(route => {
  items.push(routeToMenuItem(route));
});

const handleClick: MenuProps['onClick'] = e => {
  console.log('click', e);
  const path = e.key as string;  // Ensure key is a string
  router.push(path);
};

watch(openKeys, val => {
  console.log('openKeys', val);
});
</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-right {
    margin-left: auto;
}
</style>
