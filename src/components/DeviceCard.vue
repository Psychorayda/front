<script lang="ts" setup>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { Device, Property, Command, PropertyMetaData, CommandMetaData } from '../store/socket';

const store = useStore();
const deviceList = computed<Device[]>(() => store.getters.deviceList);

</script>