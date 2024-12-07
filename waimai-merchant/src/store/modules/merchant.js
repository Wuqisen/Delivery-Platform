import { merchantAPI } from '../../api/merchant'

export default {
  namespaced: true,
  
  state: {
    info: null,
    statistics: null
  },

  mutations: {
    SET_INFO(state, info) {
      state.info = info
    },
    SET_STATISTICS(state, statistics) {
      state.statistics = statistics
    }
  },

  actions: {
    async login({ commit }, credentials) {
      const res = await merchantAPI.login(credentials)
      localStorage.setItem('merchant_token', res.data.token)
      commit('SET_INFO', res.data.merchantInfo)
      return res
    },

    async getInfo({ commit }) {
      const res = await merchantAPI.getInfo()
      commit('SET_INFO', res.data)
      return res
    },

    async getStatistics({ commit }) {
      const res = await merchantAPI.getStatistics()
      commit('SET_STATISTICS', res.data)
      return res
    },

    logout({ commit }) {
      localStorage.removeItem('merchant_token')
      commit('SET_INFO', null)
      commit('SET_STATISTICS', null)
    }
  }
} 