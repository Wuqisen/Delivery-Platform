import { createStore } from 'vuex'
import merchant from './modules/merchant'
import order from './modules/order'

export default createStore({
  modules: {
    merchant,
    order
  }
}) 