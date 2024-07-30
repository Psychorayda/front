import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import app from "../main";
import router from '../router/index';


export interface DeviceStatus {
    statusInt: number;
    statusStr: string;
}

export interface PropertyMetaData {
    value: number | string | boolean | null;
    desc: string;
    egu: string;
    writable: boolean;
    opts: {
        [optKey: number]: string;
    };
    type: 'INT' | 'DOUBLE' | 'STRING';
}

export interface Property {
    [propName: string]: PropertyMetaData;
}

export interface CommandMetaData {
    desc: string;
    args: {
        [argName: string]: 'INT' | 'DOUBLE' | 'STRING';
    }
}

export interface Command {
    [cmdName: string]: CommandMetaData;
}

export interface Device {
    deviceName: string;
    status: DeviceStatus;
    props: Array<Property>;
    commands: Array<Command>;
}

export interface Log {
    deviceName: string;
    level: string;
    message: string;
    time: string;
}

export interface ConnMessage {
    deviceName: string;
    connected: boolean;
}

export interface StatusMessage {
    deviceName: string;
    statusInt: number;
    statusStr: string;
}

export interface MetaMessage {
    deviceName: string;
    metadata: {
        [propName: string]: PropertyMetaData;
    };
}

export interface PropMessage {
    deviceName: string;
    prop: {
        [propName: string]: string;
    };
}

export interface CmdMessage {
    deviceName: string;
    commands: {
        [cmdName: string]: CommandMetaData;
    };
}

export interface LogMessage {
    deviceName: string;
    level: string;
    message: string;
    time: string;
}

export interface PongMessage {
    deviceName: string;
    time: string;
    count: number;
}

export interface PingMessage {
    deviceName: string;
    time: string;
    count: number;
}

export type SocketMessage =
    | { route: "CONN"; data: ConnMessage }
    | { route: "STATUS"; data: StatusMessage }
    | { route: "META"; data: MetaMessage }
    | { route: "PROP"; data: PropMessage }
    | { route: "CMD"; data: CmdMessage }
    | { route: "LOG"; data: LogMessage }
    | { route: "PING"; data: PingMessage }
    | { route: "PONG"; data: PongMessage };


export interface User {
    id: number | null;
    name: string;
    email: string;
    disabled: boolean;
    roles: Array<Role>;
    isAuthenticated: boolean;
}

export interface Role {
    id: number;
    name: string;
    desc: string;
    perms: Array<Perm>;
}

export interface Perm {
    id: number;
    name: string;
    desc: string;
}

export interface Socket {
    pingPong: {
        ping: PingMessage,
        pong: PongMessage
    },
    status: {
        isConnected: boolean,
        message: SocketMessage,
        reconnectError: boolean,
        heartBeatInterval: number,
        heartBeatTimer: number | NodeJS.Timeout
    }
}


export default createStore({
    state: {
        user: {
            id: null,
            name: '',
            email: '',
            disabled: false,
            roles: [] as Array<Role>,
            isAuthenticated: false,
        } as User,
        filteredRoutes: [] as Array<any>,
        devices: [] as Array<Device>,
        logs: [] as Array<Log>,
        socket: {
            pingPong: {
                ping: "" as PingMessage | "",
                pong: "" as PongMessage | ""
            },
            status: {
                isConnected: false,
                message: "" as SocketMessage | "",
                reconnectError: false,
                heartBeatInterval: 5000,
                heartBeatTimer: 0 as number | NodeJS.Timeout
            }
        } as Socket
    },
    mutations: {
        SOCKET_ONOPEN(state, event) {
            app.config.globalProperties.$socket = event.currentTarget;
            state.socket.status.isConnected = true;
            console.log("SOCKET_ONOPEN");
            let count = 0;
            state.socket.status.heartBeatTimer = setInterval(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                if (state.socket.status.isConnected) {
                    app.config.globalProperties.$socket.send(
                        JSON.stringify({
                            route: "PING",
                            data: {
                                time: formattedTime,
                                count: ++count
                            }
                        })
                    );
                }
                // console.log(`SOCKET_HEART_BEAT_PING: ${formattedTime} Count: ${count}`);
            }, state.socket.status.heartBeatInterval);
        },
        SOCKET_ONMESSAGE(state, message) {
            try {
                const parsedMessage: SocketMessage = JSON.parse(message.data);
                state.socket.status.message = parsedMessage;
                // console.log(parsedMessage);
                let existingDevice: Device | undefined = state.devices.find(device => device.deviceName === parsedMessage.data.deviceName);
                if (parsedMessage.route == "CONN") {
                    if (parsedMessage.data.connected) {
                        if (!existingDevice) {
                            state.devices.push({
                                deviceName: parsedMessage.data.deviceName,
                                status: { statusInt: 0, statusStr: "" },
                                props: [],
                                commands: []
                            });
                        }
                    } else {
                        if (existingDevice) {
                            state.devices = state.devices.filter(device => device.deviceName !== parsedMessage.data.deviceName);
                        }
                    }
                } else if (parsedMessage.route == "STATUS") {
                    if (existingDevice) {
                        existingDevice.status = {
                            statusInt: parsedMessage.data.statusInt,
                            statusStr: parsedMessage.data.statusStr
                        };
                    }
                } else if (parsedMessage.route == "META") {
                    if (existingDevice) {
                        existingDevice.props = Object.keys(parsedMessage.data.metadata).map(propName => ({
                            [propName]: parsedMessage.data.metadata[propName]
                        }));
                    }
                } else if (parsedMessage.route == "PROP") {
                    if (existingDevice) {
                        const propName = Object.keys(parsedMessage.data.prop)[0];
                        const propValue = parsedMessage.data.prop[propName];
                        const propIndex = existingDevice.props.findIndex(prop => Object.keys(prop)[0] === propName);
                        if (propIndex >= 0) {
                            existingDevice.props[propIndex][propName].value = propValue;
                        } else {
                            existingDevice.props.push({ [propName]: { value: propValue, desc: "", egu: "", writable: false, opts: {}, type: 'STRING' } });
                        }
                    }
                } else if (parsedMessage.route == "CMD") {
                    if (existingDevice) {
                        existingDevice.commands = Object.keys(parsedMessage.data.commands).map(cmdName => ({
                            [cmdName]: parsedMessage.data.commands[cmdName]
                        }));
                    }
                } else if (parsedMessage.route == "LOG") {
                    state.logs.push(parsedMessage.data);
                } else if (parsedMessage.route == "PING") {
                    state.socket.pingPong.ping = parsedMessage.data;
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                    app.config.globalProperties.$socket.send(
                        JSON.stringify({
                            route: "PONG",
                            data: {
                                time: formattedTime,
                                count: parsedMessage.data.count
                            }
                        })
                    );
                } else if (parsedMessage.route == "PONG") {
                    state.socket.pingPong.pong = parsedMessage.data;
                } else {
                    console.error("Unknown route, please check remote");
                }
                // console.log(state.devices)
            } catch (error) {
                console.error("Failed to parse message:", message.data, error);
            }
        },
        SOCKET_ONCLOSE(state, event) {
            state.socket.status.isConnected = false;
            clearInterval(state.socket.status.heartBeatTimer);
            state.socket.status.heartBeatTimer = 0;
            console.log("SOCKET_ONCLOSE: " + new Date());
            console.log(event);
        },
        SOCKET_ONERROR(state, event) {
            console.error(state, event);
        },
        SOCKET_RECONNECT(state, count) {
            console.info("SOCKET_RECONNECT...", state, count);
        },
        SOCKET_RECONNECT_ERROR(state) {
            state.socket.status.reconnectError = true;
        },

        SET_USER(state, user: User) {
            state.user = { ...user, isAuthenticated: true };
        },
        LOGOUT(state) {
            state.user = { id: null, name: '', email: '', disabled: false, roles: [], isAuthenticated: false };
            state.filteredRoutes = [];
        },

        SET_FILTERED_ROUTES(state, routes) {
            state.filteredRoutes = routes;
        },
    },
    getters: {
        deviceList: (state) => {
            return state.devices
        },
        deviceLogs: (state) => {
            return state.logs
        },

        isAuthenticated: (state) => state.user.isAuthenticated,
        user: (state) => state.user,
        filteredRoutes: (state) => state.filteredRoutes,
    },
    actions: {
        login({ commit }, userInfo: User) {
            commit('SET_USER', userInfo);
        },
        logout({ commit }) {
            commit('LOGOUT');
        },

        filterRoutes({ state, commit }) {
            const userRoles = state.user.roles.map(role => role.name);
            const filteredRoutes = router.options.routes.filter(route => {
                if (route.meta && Array.isArray(route.meta.roles)) {
                    return route.meta.roles.some(role => userRoles.includes(role));
                }
                return false;
            });
            filteredRoutes.forEach(route => {
                router.addRoute(route);
            });
            commit('SET_FILTERED_ROUTES', filteredRoutes);
        },
    },
    modules: {},
    plugins: [
        createPersistedState({
            key: 'app',
            storage: window.localStorage,
            paths: ['user', 'filteredRoutes']
        })
    ]
})

