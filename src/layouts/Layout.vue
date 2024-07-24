<script lang="ts" setup>
import { ref } from 'vue';
import LoginModal from '../components/LoginModal.vue';

const selectedKeys1 = ref<string[]>(['1']);
const selectedKeys2 = ref<string[]>(['1']);
const openKeys = ref<string[]>(['sub1']);

const showLoginModal = ref<boolean>(false);

const openLoginModal = () => {
    showLoginModal.value = true;
};

const closeLoginModal = () => {
    showLoginModal.value = false;
};
</script>

<template>
    <a-layout>
        <a-layout-header class="header">
            <div class="logo" />
            <a-menu v-model:selectedKeys="selectedKeys1" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
                <a-menu-item key="1">
                    <nav>
                        <router-link to="/">Home</router-link>
                    </nav>
                </a-menu-item>
                <a-menu-item key="2">
                    <nav>
                        <router-link to="/device">Device</router-link>
                    </nav>
                </a-menu-item>
                <a-menu-item key="3">
                </a-menu-item>
            </a-menu>
            <div class="menu-right">
                <a-button type="primary" @click="openLoginModal">Login</a-button>
            </div>
        </a-layout-header>
        <a-layout>
            <a-layout-sider width="200" style="background: #fff">
                <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys" mode="inline"
                    :style="{ height: '100%', borderRight: 0 }">
                    <a-sub-menu key="sub1">
                        <template #title>
                            <span>
                                <user-outlined />
                                subnav 1
                            </span>
                        </template>
                        <a-menu-item key="1">option1</a-menu-item>
                        <a-menu-item key="2">option2</a-menu-item>
                        <a-menu-item key="3">option3</a-menu-item>
                        <a-menu-item key="4">option4</a-menu-item>
                    </a-sub-menu>
                    <a-sub-menu key="sub2">
                        <template #title>
                            <span>
                                <laptop-outlined />
                                subnav 2
                            </span>
                        </template>
                        <a-menu-item key="5">option5</a-menu-item>
                        <a-menu-item key="6">option6</a-menu-item>
                        <a-menu-item key="7">option7</a-menu-item>
                        <a-menu-item key="8">option8</a-menu-item>
                    </a-sub-menu>
                    <a-sub-menu key="sub3">
                        <template #title>
                            <span>
                                <notification-outlined />
                                subnav 3
                            </span>
                        </template>
                        <a-menu-item key="9">option9</a-menu-item>
                        <a-menu-item key="10">option10</a-menu-item>
                        <a-menu-item key="11">option11</a-menu-item>
                        <a-menu-item key="12">option12</a-menu-item>
                    </a-sub-menu>
                </a-menu>
            </a-layout-sider>
            <a-layout style="padding: 0 24px 24px">
                <a-breadcrumb style="margin: 16px 0">
                    <a-breadcrumb-item>Home</a-breadcrumb-item>
                    <a-breadcrumb-item>List</a-breadcrumb-item>
                    <a-breadcrumb-item>App</a-breadcrumb-item>
                </a-breadcrumb>
                <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '800px' }">
                    <router-view></router-view>
                </a-layout-content>
            </a-layout>
            <LoginModal :open="showLoginModal" :onClose="closeLoginModal"></LoginModal>
        </a-layout>
    </a-layout>
</template>

<style scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* .logo {
    float: left;
    width: 120px;
    height: 31px;
    margin: 16px 24px 16px 0;
    background: rgba(255, 255, 255, 0.3);
} */

.menu {
    flex: 1;
}

.menu-right {
    margin-left: auto;
}

#components-layout-demo-top-side-2 .logo {
    float: left;
    width: 120px;
    height: 31px;
    margin: 16px 24px 16px 0;
    background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
    float: right;
    margin: 16px 0 16px 24px;
}

.site-layout-background {
    background: #fff;
}
</style>