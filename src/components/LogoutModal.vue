<!-- loginModal.vue -->
<script lang="ts" setup>
import { ref } from 'vue';
import { useStore } from 'vuex';


const onFinish = (values: any) => {
    console.log('Success:', values);
    closeModal();
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const modalText = ref<string>('Content of the modal');
const confirmLoading = ref<boolean>(false);

const props = defineProps<{ open: boolean; onClose: () => void }>();
const closeModal = () => {
    props.onClose();
    confirmLoading.value = false;
};

const store = useStore();

const handleOk = async () => {
    confirmLoading.value = true;
    if (store.getters.user.isAuthenticated) {
        store.dispatch('logout');
        store.dispatch('filterRoutes');
        modalText.value = 'The modal will be closed after two seconds';
        setTimeout(() => {
            confirmLoading.value = false;
            closeModal();
        }, 2000);
        console.log(store.getters.filteredRoutes);
    };
};
</script>

<template>
    <a-modal :open="props.open" title="Logout" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="closeModal">
        <a-form name="normal_logout" @finish="onFinish" @finishFailed="onFinishFailed">You sure wanna logout?</a-form>
    </a-modal>
</template>
