import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import VueNativeSock from 'vue-native-websocket-vue3';

import router from './router';
import user_store from './store/user';
import socket_store from './store/socket';


const app = createApp(App)

app.use(Antd).use(router).use(user_store).use(socket_store)

app.use(VueNativeSock, "ws://localhost:9090/ws/" ,{
    store: socket_store,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
})

app.mount('#app');

export default app
