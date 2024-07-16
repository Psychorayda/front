import { createStore } from "vuex";
import app from "../main";

export default createStore({
  state: {
    socket: {
      // 连接状态
      isConnected: false,
      // 消息内容
      message: "",
      // 重新连接错误
      reconnectError: false,
      // 心跳消息发送时间
      heartBeatInterval: 5000,
      // 心跳定时器
      heartBeatTimer: 0
    }
  },
  mutations: {
    // 连接打开
    SOCKET_ONOPEN(state, event) {
      app.config.globalProperties.$socket = event.currentTarget;
      state.socket.isConnected = true;
      console.log("SOCKET_ONOPEN");
      // 连接成功时启动定时发送心跳消息，避免被服务器断开连接
      state.socket.heartBeatTimer = setInterval(() => {
        const message = "heart beat";
        if (state.socket.isConnected) {
          app.config.globalProperties.$socket.send(
            JSON.stringify({
              code: 200,
              msg: message
            })
          );
        }
        console.log("SOCKET_HEART_BEAT");
      }, state.socket.heartBeatInterval);
    },
    // 连接关闭
    SOCKET_ONCLOSE(state, event) {
      state.socket.isConnected = false;
      // 连接关闭时停掉心跳消息
      clearInterval(state.socket.heartBeatTimer);
      state.socket.heartBeatTimer = 0;
      console.log("SOCKET_ONCLOSE: " + new Date());
      console.log(event);
    },
    // 发生错误
    SOCKET_ONERROR(state, event) {
      console.error(state, event);
    },
    // 收到服务端发送的消息
    SOCKET_ONMESSAGE(state, message) {
      state.socket.message = message;
      console.log(message.data)
    },
    // 自动重连
    SOCKET_RECONNECT(state, count) {
      console.info("SOCKET_RECONNECT...", state, count);
    },
    // 重连错误
    SOCKET_RECONNECT_ERROR(state) {
      state.socket.reconnectError = true;
    }
  },
  modules: {}
})