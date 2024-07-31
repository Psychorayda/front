<script lang="ts" setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { AntDesignOutlined } from '@ant-design/icons-vue';
import LoginModal from '../components/LoginModal.vue';
import LogoutModal from '../components/LogoutModal.vue';

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

const store = useStore();
const router = useRouter();

</script>

<template>
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
        <a-layout>
            <a-layout-sider width="200" style="background: #fff">
            </a-layout-sider>
            <a-layout style="padding: 24px 24px 0px">
                <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '800px' }">
                    <router-view />
                </a-layout-content>
                <LoginModal :open="showLoginModal" :onClose="closeLoginModal"></LoginModal>
                <LogoutModal :open="showLogoutModal" :on-close="closeLogoutModal"></LogoutModal>
                <a-layout-footer style="text-align: center">Footer</a-layout-footer>
            </a-layout>
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
</style>
