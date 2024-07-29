<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { Device, PropertyMetaData, CommandMetaData } from '../store/socket';


const confirmLoading = ref<boolean>(false);

const store = useStore();
const deviceList = computed<Device[]>(() => store.getters.deviceList);

const tabList = computed(() =>
    deviceList.value.map((device: Device) => ({
        key: device.deviceName,
        tab: device.deviceName
    }))
);
const selectedTab = ref(deviceList.value.length > 0 ? deviceList.value[0].deviceName : '');
const onTabChange = (newValue: string) => {
    selectedTab.value = newValue;
};

const selectedDevice = computed(() => {
    if (!selectedTab.value) return null;
    return deviceList.value.find(dev => dev.deviceName === selectedTab.value) || null;
});

const devPropsColumns = [
    { title: 'Property', key: 'propName' },
    { title: 'Value', key: 'value' },
    { title: 'Type', key: 'type' },
    { title: 'Description', key: 'desc' },
    { title: 'Operation', key: 'operation' }
];

const propsList = computed(() => {
    if (!selectedDevice.value) return [];
    return Object.entries(selectedDevice.value.props.reduce((acc, prop) => ({ ...acc, ...prop }), {}))
        .map(([propName, prop]: [string, PropertyMetaData]) => ({
            key: propName,
            propName,
            value: prop.value,
            desc: prop.desc,
            type: prop.type,
            operation: prop.writable ? 'Set' : 'Read-Only'
        }));
});

const openSetPropModal = ref<boolean>(false);
const currPropInput = ref<any>(null);
const selectedProp = ref<string | null>(null);

const onWritePropClick = (propName: string) => {
    selectedProp.value = propName;
    openSetPropModal.value = true;
};

const handleSetOk = async () => {
    if (!selectedProp.value || !selectedTab.value) return;

    confirmLoading.value = true;
    const prop = propsList.value.find(item => item.key === selectedProp.value);
    if (prop) {
        try {
            const response = await fetch('http://localhost:9090/teles/set', {
                method: 'POST',
                body: JSON.stringify({
                    peer_name: selectedTab.value,
                    prop_name: selectedProp.value,
                    val: currPropInput.value
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setTimeout(() => {
                    confirmLoading.value = false;
                    openSetPropModal.value = false;
                    currPropInput.value = null;
                    selectedProp.value = null;
                }, 1000);
                alert("Property set OK");
            } else {
                const errorData = await response.json();
                setTimeout(() => {
                    confirmLoading.value = false;
                    openSetPropModal.value = false;
                    currPropInput.value = null;
                    selectedProp.value = null;
                }, 2000);
                alert(`Property set failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error:', error);
            confirmLoading.value = false;
        }
    }
};

const devCmdsColumns = [
    { title: 'Command', key: 'cmdName' },
    { title: 'Description', key: 'desc' },
    { title: 'Operation', key: 'operation' }
];

const cmdsList = computed(() => {
    if (!selectedDevice.value) return [];
    return Object.entries(selectedDevice.value.commands.reduce((acc, cmd) => ({ ...acc, ...cmd }), {}))
        .map(([cmdName, cmd]: [string, CommandMetaData]) => ({
            key: cmdName,
            cmdName,
            args: cmd.args,
            desc: cmd.desc,
            operation: "Send",
        }));
});

const selectedCmdArgs = computed(() => {
    if (!selectedCmd.value) return [];
    const cmd = cmdsList.value.find(item => item.key === selectedCmd.value);
    return cmd ? cmd.args : [];
});

const openSendCmdModal = ref<boolean>(false);
const selectedCmd = ref<string | null>(null);
const currCmdInputs = ref<{ [key: string]: any }>({});

const onSendCmdClick = (cmdName: string) => {
    selectedCmd.value = cmdName;
    currCmdInputs.value = {};
    const cmd = cmdsList.value.find(item => item.key === cmdName);
    if (cmd) {
        for (const argName in cmd.args) {
            currCmdInputs.value[argName] = '';
        }
    }
    openSendCmdModal.value = true;
};

const handleCmdOk = async () => {
    if (!selectedCmd.value || !selectedTab.value) return;

    confirmLoading.value = true;

    let commandString;
    const cmdArgs = Object.values(currCmdInputs.value).filter(arg => arg !== '').join(',');
    if (cmdArgs.length === 0) {
        commandString = `${selectedCmd.value}`;
    } else {
        commandString = `${selectedCmd.value},${cmdArgs}`;
    }

    try {
        const response = await fetch('http://localhost:9090/teles/cmd', {
            method: 'POST',
            body: JSON.stringify({
                peer_name: selectedTab.value,
                command: commandString
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            setTimeout(() => {
                confirmLoading.value = false;
                openSendCmdModal.value = false;
                selectedCmd.value = null;
                currCmdInputs.value = {};
            }, 1000);
            alert("Command sent OK");
        } else {
            const errorData = await response.json();
            setTimeout(() => {
                confirmLoading.value = false;
                openSendCmdModal.value = false;
                selectedCmd.value = null;
                currCmdInputs.value = {};
            }, 2000);
            alert(`Command sent failed: ${errorData.detail}`);
        }
    } catch (error) {
        console.error('Error:', error);
        confirmLoading.value = false;
    }
};
</script>

<template>
    <a-card style="width: 100%" title="Devices" :tab-list="tabList" :active-tab-key="selectedTab"
        @tabChange="onTabChange">
        <div v-if="selectedDevice">
            <a-table :columns="devPropsColumns" :data-source="propsList" :pagination="false" bordered>
                <template #headerCell="{ column }">
                    <span class="centered-cell">{{ column.title }}</span>
                </template>
                <template #bodyCell="{ column, record }">
                    <span v-if="column.key === 'operation'">
                        <span class="centered-cell">
                            <a-typography-link @click="() => onWritePropClick(record.key)">
                                {{ record.operation }}
                            </a-typography-link>
                            <a-modal v-model:open="openSetPropModal" title="Set Property"
                                :confirm-loading="confirmLoading" @ok="handleSetOk">
                                <p>Device: {{ selectedTab }}.</p>
                                <p>Property: {{ selectedProp }}.</p>
                                <p>Type: {{ record.type }}.</p>
                                <div>
                                    <a-input v-model:value="currPropInput" placeholder="Input value you want to set" allow-clear />
                                </div>
                                <br />
                            </a-modal>
                        </span>
                    </span>
                    <span v-else>
                        <span class="centered-cell">{{ record[column.key] }}</span>
                    </span>
                </template>
            </a-table>
            <br />
            <a-table :columns="devCmdsColumns" :data-source="cmdsList" :pagination="false" bordered>
                <template #headerCell="{ column }">
                    <span class="centered-cell">{{ column.title }}</span>
                </template>
                <template #bodyCell="{ column, record }">
                    <span v-if="column.key === 'operation'">
                        <span class="centered-cell">
                            <a-typography-link @click="() => onSendCmdClick(record.key)">
                                {{ record.operation }}
                            </a-typography-link>
                            <a-modal v-model:open="openSendCmdModal" title="Send Command"
                                :confirm-loading="confirmLoading" @ok="handleCmdOk">
                                <p>Device: {{ selectedTab }}.</p>
                                <p>Command: {{ selectedCmd }}.</p>
                                <div v-for="(argType, argName) in selectedCmdArgs"
                                    :key="argName">
                                    <p>Argument: {{ argName }}({{ argType }})</p>
                                    <a-input v-model:value="currCmdInputs[argName]" :placeholder="`Input ${argName}`"
                                        allow-clear />
                                </div>
                                <br />
                            </a-modal>
                        </span>
                    </span>
                    <span v-else>
                        <span class="centered-cell">{{ record[column.key] }}</span>
                    </span>
                </template>
            </a-table>
        </div>
    </a-card>
</template>

<style scoped>
.centered-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>
