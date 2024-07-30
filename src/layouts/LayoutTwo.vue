<template>
    <a-menu
      id="dddddd"
      v-model:openKeys="openKeys"
      v-model:selectedKeys="selectedKeys"
      style="width: 256px"
      mode="inline"
      :items="items"
      @click="handleClick"
    ></a-menu>
  </template>
  
  <script lang="ts" setup>
  import { reactive, ref, watch, h } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
  import type { MenuProps, ItemType } from 'ant-design-vue';
  
  const store = useStore();
  const router = useRouter();
  
  const selectedKeys = ref<string[]>(['1']);
  const openKeys = ref<string[]>(['sub1']);
  
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
  