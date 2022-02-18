export const cartActionTypes = {
  BUSY_ORDER_FORM: 'BUSY_ORDER_FORM',
}

export const setBusyOrder = () => (dispatch) => {
  return dispatch({ type: cartActionTypes.BUSY_ORDER_FORM, busyOrder: true })
}
