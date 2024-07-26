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

const commandsArgsColumns = [
    { title: 'Argument Name', dataIndex: 'argName' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Set', dataIndex: 'set' }
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
            operation: prop.writable ? "change" : null,
            opts: prop.opts
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
            desc: cmd.desc,
            args: cmd.args,
            expanded: false,
            editable: false
        }));
});

const commandsArgsDataSource = computed(() => {
    if (!selectedDevice.value) return [];
    const selectedCommand = commandsDataSource.value.find(cmd => cmd.expanded);
    if (!selectedCommand) return [];
    return Object.entries(selectedCommand.args).map(([argName, type]) => ({
        key: argName,
        argName,
        type,
        set: selectedCommand.editable ? commandArgsData[selectedCommand.key]?.[argName] : ''
    }));
});

const editablePropsData = reactive<Record<string, { value: string | number | boolean | null }>>({});
const commandArgsData = reactive<Record<string, { [argName: string]: string | number | null }>>({});

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
    try {
        const response = await fetch('http://localhost:9090/teles/set', {
            method: 'POST',
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
            alert("Property set OK");
        } else {
            const errorData = await response.json();
            alert(`Property set failed: ${errorData.detail}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    console.log(`Saving property ${propName} of device ${deviceName} with new value: ${newValue}`);
};

const confirmEdit = (key: string) => {
    const prop = propsDataSource.value.find(item => item.key === key);
    if (prop) {
        editablePropsData[key] = { value: prop.value };
    }
};

const sendCommand = (cmdName: string) => {
    console.log(cmdName)
    commandArgsData[cmdName] = {};
    const command = commandsDataSource.value.find(cmd => cmd.key === cmdName);
    console.log(command)
    if (command) {
        command.expanded = true;
        command.editable = true;
    }
};

const cancelCommand = (cmdName: string) => {
    const command = commandsDataSource.value.find(cmd => cmd.key === cmdName);
    if (command) {
        command.expanded = false;
        command.editable = false;
    }
    delete commandArgsData[cmdName];
};

const handleSendCommand = async (deviceName: string, cmdName: string, args: Record<string, string | number | null>) => {
    try {
        const response = await fetch('http://localhost:9090/teles/send_command', {
            method: 'POST',
            body: JSON.stringify({
                peer_name: deviceName,
                cmd_name: cmdName,
                args
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            alert("Command sent successfully");
        } else {
            const errorData = await response.json();
            alert(`Command send failed: ${errorData.detail}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    console.log(`Sending command ${cmdName} to device ${deviceName} with args:`, args);
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
                        <template v-if="editablePropsData[record.key]">
                            <template v-if="Object.keys(record.opts).length > 0">
                                <a-select v-model:value="editablePropsData[record.key].value"
                                    style="margin: -5px 0; width: 100%">
                                    <a-select-option v-for="(option, key) in record.opts" :key="key" :value="key">{{option }}</a-select-option>
                                </a-select>
                            </template>
                            <template v-else>
                                <a-input v-model:value="editablePropsData[record.key].value" style="margin: -5px 0" />
                            </template>
                        </template>
                        <template v-else>
                            {{ text }}
                        </template>
                    </template>
                    <template v-else-if="column.dataIndex === 'operation'">
                        <div class="editable-row-operations">
                            <span v-if="editablePropsData[record.key]">
                                <a-typography-link @click="saveProp(selectedTab, record.key)">Save</a-typography-link>
                                <a @click="cancelPropEdit(record.key)">Cancel</a>
                            </span>
                            <span v-else-if="record.operation === 'change'">
                                <a-popconfirm title="Sure to edit?" @confirm="confirmEdit(record.key)">
                                    <a>Edit</a>
                                </a-popconfirm>
                            </span>
                        </div>
                    </template>
                    <template v-else>
                        {{ text }}
                    </template>
                </template>
            </a-table>
            <a-table :columns="commandsColumns" :data-source="commandsDataSource" :pagination="false" bordered
                style="margin-top: 16px;" class="components-table-demo-nested">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'operation'">
                        <span v-if="!commandArgsData[record.key]">
                            <a-popconfirm title="Sure to send?" @confirm="sendCommand(record.key)">
                                <a>Send</a>
                            </a-popconfirm>
                        </span>
                        <span v-else>
                            <a @click="handleSendCommand(selectedTab, record.key, commandArgsData[record.key])">Send</a>
                            <a @click="cancelCommand(record.key)">Cancel</a>
                        </span>
                    </template>
                </template>
                <template #expandedRowRender>
                    <a-table :columns="commandsArgsColumns" :data-source="commandsArgsDataSource" :pagination="false">
                        <template #bodyCell="{ column, text, record }">
                            <template v-if="column.dataIndex === 'set'">
                                <template v-if="record.editable">
                                    <a-input style="margin: -5px 0"
                                        :value="commandArgsData[record.key]?.[record.argName]"
                                        @input="(e: InputEvent) => commandArgsData[record.key][record.argName] = (e.target as HTMLInputElement).value" />
                                </template>
                                <template v-else>
                                    {{ text }}
                                </template>
                            </template>
                        </template>
                    </a-table>
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
