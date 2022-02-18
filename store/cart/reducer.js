import { cartActionTypes } from './action'

const cartInitialState = {
  busyOrder: false,
}

export default function reducer(state = cartInitialState, action) {
  switch (action.type) {
    case cartActionTypes.BUSY_ORDER_FORM:
      return Object.assign({}, state, {
        busyOrder: action.busyOrder,
      })
    default:
      return state
  }
}
