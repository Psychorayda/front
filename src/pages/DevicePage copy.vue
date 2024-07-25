<script lang="ts" setup>
import { computed, reactive, ref, h } from 'vue';
import { useStore } from 'vuex';
import { HomeOutlined } from '@ant-design/icons-vue';
import { Device, Property, Command, PropertyMetaData, CommandMetaData } from '../store/socket';


const store = useStore();
const deviceList = computed<Device[]>(() => store.getters.deviceList);

const tabList = computed(() =>
    deviceList.value.map((device: Device) => ({
        key: device.deviceName,
        tabName: device.deviceName
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
    { title: 'Property Name', index: 'propName' },
    { title: 'Value', index: 'value' },
    { title: 'Type', index: 'type' },
    // { title: 'Egu', index: 'egu' },
    { title: 'Description', index: 'desc' },
    { title: 'Operation', index: 'operation' }
];

// const devCmdsColumns = [
//     { title: 'Command Name', dataIndex: 'cmdName' },
//     // { title: 'Arguments Count', dataIndex: 'argsCount' },
//     { title: 'Description', dataIndex: 'desc' },
//     { title: 'Operation', dataIndex: 'operation' }
// ];

const propsList = computed(() => {
    if (!selectedDevice.value) return [];
    return Object.entries(selectedDevice.value.props.reduce((acc, prop) => ({ ...acc, ...prop }), {}))
        .map(([propName, prop]: [string, PropertyMetaData]) => ({
            key: propName,
            propName,
            value: prop.value,
            // egu: prop.egu,
            desc: prop.desc,
            type: prop.type,
            operation: prop.writable,
            opts: prop.opts
        }));
});

</script>

<template>
    
</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>

