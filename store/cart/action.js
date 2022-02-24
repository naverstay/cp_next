export const cartActionTypes = {
  BUSY_ORDER_FORM: 'BUSY_ORDER_FORM',
  ORDER_SENT: 'ORDER_SENT',
}

export const setBusyOrder = () => (dispatch) => {
  return dispatch({ type: cartActionTypes.BUSY_ORDER_FORM, busyOrder: true })
}

export const setOrderSent = () => (dispatch) => {
  return dispatch({ type: cartActionTypes.BUSY_ORDER_FORM, orderSent: true })
}
