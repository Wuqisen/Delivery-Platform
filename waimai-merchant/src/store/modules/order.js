import { orderAPI } from '@/api/order'

export default {
  namespaced: true,
  state: {
    orders: [],
    total: 0,
    loading: false
  },
  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders
    },
    SET_TOTAL(state, total) {
      state.total = total
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    async getOrders({ commit }, params) {
      try {
        commit('SET_LOADING', true)
        const res = await orderAPI.getOrders(params)
        commit('SET_ORDERS', res.data.list)
        commit('SET_TOTAL', res.data.total)
      } catch (error) {
        console.error('获取订单列表失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async confirmOrder({ dispatch }, orderId) {
      await orderAPI.confirmOrder(orderId)
      dispatch('getOrders')
    },
    async assignRider({ dispatch }, { orderId, riderId }) {
      await orderAPI.assignRider(orderId, riderId)
      dispatch('getOrders')
    }
  }
} 