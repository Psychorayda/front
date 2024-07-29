<!-- loginModal.vue -->
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

interface FormState {
    username: string;
    password: string;
    remember: boolean;
}

const formState = reactive<FormState>({
    username: '',
    password: '',
    remember: true,
});

const onFinish = (values: any) => {
    console.log('Success:', values);
    closeModal();
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

// const disabled = computed(() => {
//     return !(formState.username && formState.password);
// });

const modalText = ref<string>('Content of the modal');
const confirmLoading = ref<boolean>(false);

const props = defineProps<{ open: boolean; onClose: () => void }>();
const closeModal = () => {
    props.onClose();
    confirmLoading.value = false;
};

// const resetNamePassword = () => {
//     formState.username = '';
//     formState.password = '';
// };

const router = useRouter();
const store = useStore();

const handleOk = async () => {
    modalText.value = 'The modal will be closed after two seconds';
    confirmLoading.value = true;
    if (formState.username && formState.password) {
        try {
            const response = await fetch('http://localhost:9090/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    name: formState.username,
                    password: formState.password,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const userInfo = await response.json()
                store.dispatch('login', userInfo);
                setTimeout(() => {
                    closeModal();
                    router.push('/');
                }, 2000);
                console.log(store.getters.user)
            } else {
                const errorData = await response.json();
                alert(`Login failed:  ${errorData.detail}`);
                confirmLoading.value = false;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
};
</script>

<template>
    <a-modal :open="props.open" title="Login" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="closeModal">
        <a-form :model="formState" name="normal_login" class="login-form" @finish="onFinish"
            @finishFailed="onFinishFailed">
            <a-form-item label="Username" name="username"
                :rules="[{ required: true, message: 'Please input your username!' }]">
                <a-input v-model:value="formState.username">
                    <template #prefix>
                        <UserOutlined class="site-form-item-icon" />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="Password" name="password"
                :rules="[{ required: true, message: 'Please input your password!' }]">
                <a-input-password v-model:value="formState.password">
                    <template #prefix>
                        <LockOutlined class="site-form-item-icon" />
                    </template>
                </a-input-password>
            </a-form-item>

            <!-- <a-form-item>
                <a-form-item name="remember" no-style>
                    <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
                </a-form-item>
                <a-form-item name="reset" no-style>
                    <a-button :disabled="disabled" type="primary" class="login-form-button" @click="resetNamePassword">Reset</a-button>
                </a-form-item>
            </a-form-item> -->

            <!-- <a-form-item>
                <a-form-item name="forgot" no-style>
                    <a class="login-form-forgot" href="">Forgot password</a>
                </a-form-item>
                Or
                <a-form-item name="register" no-style>
                    <a class="login-form-register" href="">Register now!</a>
                </a-form-item>
                <a-form-item name="reset" no-style>
                    <a-button :disabled="disabled" type="primary" class="login-form-button" @click="resetNamePassword">Reset</a-button>
                </a-form-item>
            </a-form-item> -->
        </a-form>
    </a-modal>
</template>
