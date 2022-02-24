import { cartActionTypes } from './action'

const cartInitialState = {
  busyOrder: false,
  orderSent: false,
}

export default function reducer(state = cartInitialState, action) {
  switch (action.type) {
    case cartActionTypes.BUSY_ORDER_FORM:
      return Object.assign({}, state, {
        busyOrder: action.busyOrder,
      })
    case cartActionTypes.ORDER_SENT:
      return Object.assign({}, state, {
        orderSent: action.orderSent,
      })
    default:
      return state
  }
}
