<script lang="ts" setup>
import { ref, reactive, h, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { AntDesignOutlined } from "@ant-design/icons-vue";
import type { MenuProps, ItemType } from "ant-design-vue";
import LoginModal from "../components/LoginModal.vue";
import LogoutModal from "../components/LogoutModal.vue";

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

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

function getItem(
  label: string,
  key: string,
  icon?: any,
  children?: ItemType[],
  type?: "group"
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as ItemType;
}

function routeToMenuItem(route: {
  meta: { title: string; icon: any };
  path: string;
}) {
  return getItem(
    route.meta.title,
    route.path,
    route.meta.icon ? () => h(route.meta.icon) : null
  );
}

const items: ItemType[] = reactive([]);

const filteredRoutes = store.getters.filteredRoutes;
filteredRoutes.forEach((route: any) => {
  items.push(routeToMenuItem(route));
});

const handleClick: MenuProps["onClick"] = (e) => {
  console.log("click", e);
  const path = e.key as string;
  router.push(path);
};

watch(openKeys, (val) => {
  console.log("openKeys", val);
});
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
        <a-menu id="sider-menu" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys"
          :style="{ height: '100%', borderRight: 0 }" mode="inline" :items="items" @click="handleClick"></a-menu>
      </a-layout-sider>
      <a-layout style="padding: 24px 24px 0px">
        <a-layout-content :style="{
          background: '#fff',
          padding: '24px',
          margin: 0,
          minHeight: '900px',
        }">
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
