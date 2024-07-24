<script lang="ts" setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { HomeOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

// const tabList = [
//     {
//         key: 'tab1',
//         tab: 'tab1',
//     },
//     {
//         key: 'tab2',
//         tab: 'tab2',
//     },
// ];
// const contentList = {
//     tab1: 'content1',
//     tab2: 'content2',
// };
// const tabListNoTitle = [
//     {
//         key: 'article',
//         tab: 'article',
//     },
//     {
//         key: 'app',
//         tab: 'app',
//     },
//     {
//         key: 'project',
//         tab: 'project',
//     },
// ];
// const key = ref('tab1');
// const noTitleKey = ref('app');

// const onTabChange = (value: string, type: string) => {
//     console.log(value, type);
//     if (type === 'key') {
//         key.value = value;
//     } else if (type === 'noTitleKey') {
//         noTitleKey.value = value;
//     }
// };

// 使用 useStore 函数获取 Vuex 仓库实例
const store = useStore();

// 使用 computed 函数创建一个计算属性来获取 deviceList
const deviceList = computed(() => store.getters.deviceList);

// 定义选项卡列表
const tabList = computed(() =>
    deviceList.value.map((device: { deviceName: any; }) => ({
        key: device.deviceName,
        tab: device.deviceName
    }))
);

// 定义当前选中的选项卡 key
const key = ref(deviceList.value.length > 0 ? deviceList.value[0].deviceName : '');

// 定义一个内容列表映射到每个设备的详细信息
const contentList = computed(() =>
    deviceList.value.reduce((acc: { [x: string]: string; }, device: { deviceName: string | number; status: { statusStr: any; }; props: any; }) => {
        acc[device.deviceName] = `Status: ${device.status.statusStr}, Properties: ${JSON.stringify(device.props)}`;
        return acc;
    }, {} as Record<string, string>)
);

// 处理选项卡变化事件
const onTabChange = (value: string) => {
    key.value = value;
};
</script>

<template>
    <a-card style="width: 100%" title="Devices" :tab-list="tabList" :active-tab-key="key" @tabChange="onTabChange">
        <template #customTab="{ item }">
            <span v-if="item && item.key">
                <HomeOutlined />
                {{ item.tab }}
            </span>
        </template>
        <!-- <template #extra>
            <a href="#">More</a>
        </template> -->
        <div v-if="key">
            {{ contentList[key] }}
        </div>
    </a-card>
    <!-- <a-card style="width: 100%" title="devices" :tab-list="tabList" :active-tab-key="key"
        @tabChange="(key: string) => onTabChange(key, 'key')">
        <template #customTab="item">
            <span v-if="item.key === 'tab1'">
                <home-outlined />
                {{ item.key }}
            </span>
        </template>
        <template #extra>
            <a href="#">More</a>
        </template>
        {{ contentList[key] }}
    </a-card> -->
    <!-- <br />
    <br />
    <a-card style="width: 100%" :tab-list="tabListNoTitle" :active-tab-key="noTitleKey"
        @tabChange="(key: string) => onTabChange(key, 'noTitleKey')">
        <p v-if="noTitleKey === 'article'">article content</p>
        <p v-else-if="noTitleKey === 'app'">app content</p>
        <p v-else>project content</p>
        <template #tabBarExtraContent>
            <a href="#">More</a>
        </template>
    </a-card> -->
</template>