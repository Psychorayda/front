// store/user_store.ts
import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export interface UserState {
  id: number | null;
  name: string;
  email: string;
  disabled: boolean;
  isAuthenticated: boolean;
}

const state = () => ({
  user: {
    id: null,
    name: '',
    email: '',
    disabled: false,
    isAuthenticated: false,
  } as UserState,
})

const getters = {
  isAuthenticated: (state: { user: UserState; }) => state.user.isAuthenticated,
  user: (state: { user: UserState; }) => state.user,
}

const actions = {
  login({ commit }, userInfo: UserState) {
    commit('SET_USER', userInfo);
  },

  logout({ commit }) {
    commit('LOGOUT');
  },
}

const mutations = {
  SET_USER(state: { user: UserState; }, user: UserState) {
    state.user = { ...user, isAuthenticated: true };
  },
  LOGOUT(state: { user: UserState; }) {
    state.user = { id: null, name: '', email: '', disabled: false, isAuthenticated: false };
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {}
}

// const user_store = createStore({
//   state: {
//     user: {
//       id: null,
//       name: '',
//       email: '',
//       disabled: false,
//       isAuthenticated: false,
//     } as UserState,
//   },
//   mutations: {
//     SET_USER(state, user: UserState) {
//       state.user = { ...user, isAuthenticated: true };
//     },
//     LOGOUT(state) {
//       state.user = { id: null, name: '', email: '', disabled: false, isAuthenticated: false };
//     },
//   },
//   actions: {
//     login({ commit }, userInfo: UserState) {
//       commit('SET_USER', userInfo);
//     },
//     logout({ commit }) {
//       commit('LOGOUT');
//     },
//   },
//   getters: {
//     isAuthenticated: (state) => state.user.isAuthenticated,
//     user: (state) => state.user,
//   },
//   plugins: [createPersistedState({
//     key: 'user_store',
//     storage: window.localStorage,
//     paths: ['user']
//   })],
// });

// export default user_store;
