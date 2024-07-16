import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
// import VueNativeSock from 'vue-native-websocket-vue3';

import router from './router';
// import store from './store/socket';


const app = createApp(App)
app.use(Antd).use(router).use(store).mount('#app');