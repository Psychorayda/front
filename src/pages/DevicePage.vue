<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { HomeOutlined } from '@ant-design/icons-vue';
import { Device, PropertyMetaData, CommandMetaData } from '../store/socket';

// 使用 useStore 函数获取 Vuex 仓库实例
const store = useStore();
// 使用 computed 函数创建一个计算属性来获取 deviceList
const deviceList = computed<Device[]>(() => store.getters.deviceList);

// 定义选项卡列表
const tabList = computed(() =>
    deviceList.value.map((device: Device) => ({
        key: device.deviceName,
        tab: device.deviceName
    }))
);
// 定义当前选中的选项卡 selectedTab
const selectedTab = ref(deviceList.value.length > 0 ? deviceList.value[0].deviceName : '');
// 处理选项卡变化事件
const onTabChange = (value: string) => {
    selectedTab.value = value;
};

// 定义一个计算属性来根据当前设备生成表格的数据源
const selectedDevice = computed(() => {
    if (!selectedTab.value) return null;
    return deviceList.value.find(dev => dev.deviceName === selectedTab.value) || null;
});

const propsColumns = [
    { title: 'Property Name', dataIndex: 'propName' },
    { title: 'Value', dataIndex: 'value' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Egu', dataIndex: 'egu' },
    { title: 'Description', dataIndex: 'desc' },
    { title: 'Operation', dataIndex: 'operation' }
];

const commandsColumns = [
    { title: 'Command Name', dataIndex: 'cmdName' },
    { title: 'Arguments Count', dataIndex: 'argsCount' },
    { title: 'Description', dataIndex: 'desc' },
    { title: 'Operation', dataIndex: 'operation' }
];

// 定义 props 和 commands 的数据源
const propsDataSource = computed(() => {
    if (!selectedDevice.value) return [];
    return Object.entries(selectedDevice.value.props.reduce((acc, prop) => ({ ...acc, ...prop }), {}))
        .map(([propName, prop]: [string, PropertyMetaData]) => ({
            key: propName,
            propName,
            value: prop.value,
            egu: prop.egu,
            desc: prop.desc,
            type: prop.type,
            operation: prop.writable ? "change" : null
        }));
});

const commandsDataSource = computed(() => {
    if (!selectedDevice.value) return [];
    return Object.entries(selectedDevice.value.commands.reduce((acc, cmd) => ({ ...acc, ...cmd }), {}))
        .map(([cmdName, cmd]: [string, CommandMetaData]) => ({
            key: cmdName,
            cmdName,
            argsCount: Object.keys(cmd.args).length,
            operation: "send",
            desc: cmd.desc
        }));
});

const editablePropsData = reactive<Record<string, { value: string | number | boolean | null }>>({});

const editProp = (key: string) => {
    const prop = propsDataSource.value.find(item => item.key === key);
    if (prop) {
        editablePropsData[key] = { value: prop.value };
    }
};

// 修改 saveProp 函数，使其触发一个处理函数
const saveProp = (deviceName: string, propName: string) => {
    const prop = propsDataSource.value.find(item => item.key === propName);
    if (prop && editablePropsData[propName]) {
        handleSaveProp(deviceName, propName, editablePropsData[propName].value);
        delete editablePropsData[propName];
    }
};

const cancelPropEdit = (propName: string) => {
    delete editablePropsData[propName];
};

// 定义一个处理函数，在保存时调用
const handleSaveProp = async (deviceName: string, propName: string, newValue: string | number | boolean | null) => {
    // 在这里执行您希望的操作，比如发出请求或其他业务逻辑
    try {
        // console.log(`${deviceName} ${propName} ${newValue}`)
        const response = await fetch('http://localhost:9090/teles/set', {
            method: 'PUT',
            body: JSON.stringify({
                peer_name: deviceName,
                prop_name: propName,
                val: newValue
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            alert("OKKKKKKKKKKKKKKKKK")
        } else {
            // const errorData = await response.json();
            alert(`NOOOOOOOOOOOOOOOO`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    console.log(`Saving property ${propName} of device ${deviceName} with new value: ${newValue}`);
};
</script>

<template>
    <a-card style="width: 100%" title="Devices" :tab-list="tabList" :active-tab-key="selectedTab"
        @tabChange="onTabChange">
        <template #customTab="{ item }">
            <span v-if="item && item.key">
                <HomeOutlined />
                {{ item.tab }}
            </span>
        </template>
        <div v-if="selectedDevice">
            <a-table :columns="[{ title: 'Status', dataIndex: 'status' }]"
                :data-source="[{ key: 'status', status: selectedDevice.status.statusStr }]" :pagination="false"
                bordered />
            <a-table :columns="propsColumns" :data-source="propsDataSource" :pagination="false" bordered
                style="margin-top: 16px;">
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.dataIndex === 'value'">
                        <a-input v-if="editablePropsData[record.key]"
                            v-model:value="editablePropsData[record.key].value" style="margin: -5px 0" />
                        <template v-else>
                            {{ text }}
                        </template>
                    </template>
                    <template v-else-if="column.dataIndex === 'operation'">
                        <div class="editable-row-operations">
                            <span v-if="editablePropsData[record.key]">
                                <a-typography-link @click="saveProp(selectedTab, record.key)">Save</a-typography-link>
                                <a-popconfirm title="Sure to cancel?" @confirm="cancelPropEdit(record.key)">
                                    <a>Cancel</a>
                                </a-popconfirm>
                            </span>
                            <span v-else-if="record.operation === 'change'">
                                <a @click="editProp(record.key)">Edit</a>
                            </span>
                        </div>
                    </template>
                    <template v-else>
                        {{ text }}
                    </template>
                </template>
            </a-table>
            <a-table :columns="commandsColumns" :data-source="commandsDataSource" :pagination="false" bordered
                style="margin-top: 16px;">
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.dataIndex === 'operation'">
                        <a @click="() => { /* handle command execution here */ }">{{ text }}</a>
                    </template>
                    <template v-else>
                        {{ text }}
                    </template>
                </template>
            </a-table>
        </div>
    </a-card>
</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>
