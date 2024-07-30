import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import VueNativeSock from 'vue-native-websocket-vue3';

import router from './router';
import store from './store/index'


const app = createApp(App)

app.use(Antd)
    .use(router)
    .use(store)
    .use(VueNativeSock, "ws://localhost:9090/ws/", {
        store: store,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000
    })

if (store.getters.isAuthenticated) {
    store.dispatch('filterRoutes');  // Filter routes on page reload if user is authenticated
}

app.mount('#app');

export default app
