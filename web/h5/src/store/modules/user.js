import Vue from 'vue'
import { login, logout } from '@/api/login'
import { ACCESS_TOKEN, ROLES } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const result = response.result
          Vue.ls.set(ACCESS_TOKEN, 'result.token', 7 * 24 * 60 * 60 * 1000)
          Vue.ls.set(ROLES, result.isProvider, 7 * 24 * 60 * 60 * 1000)

          commit('SET_TOKEN', result.personalId)
          commit('SET_INFO', result)
          commit('SET_NAME', { name: `${result.firstName} ${result.lastName}`, welcome: welcome() })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        commit('SET_AVATAR', '/avatar2.jpg')

        if (Vue.ls.get(ROLES)) {
          commit('SET_ROLES', ['admin'])
          resolve({ role: ['admin'] })
        } else {
          commit('SET_ROLES', ['user'])
          resolve({ role: ['user'] })
        }
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          Vue.ls.remove(ROLES)
          Vue.ls.remove(ACCESS_TOKEN)
        })
      })
    }

  }
}

export default user
