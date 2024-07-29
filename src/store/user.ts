// store/user_store.ts
import { createStore } from 'vuex';

// 定义用户状态接口
interface UserState {
  id: number | null;
  name: string;
  email: string;
  disabled: boolean;
  isAuthenticated: boolean;
}

const user_store = createStore({
  state: {
    user: {
      id: null,
      name: '',
      email: '',
      disabled: false,
      isAuthenticated: false,
    } as UserState,
  },
  mutations: {
    SET_USER(state, user: UserState) {
      state.user = { ...user, isAuthenticated: true };
    },
    LOGOUT(state) {
      state.user = { id: null, name: '', email: '', disabled: false, isAuthenticated: false };
    },
  },
  actions: {
    async login({ commit }, { response }) {
        commit('SET_USER', response.data);
    },
    logout({ commit }) {
      commit('LOGOUT');
    },
  },
  getters: {
    isAuthenticated: (state) => state.user.isAuthenticated,
    user: (state) => state.user,
  },
});

export default user_store;
