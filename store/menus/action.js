export const menusActionTypes = {
  OPEN_ASIDE: 'OPEN_ASIDE',
  OPEN_PROFILE: 'OPEN_PROFILE',
  OPEN_REQUISITES: 'OPEN_REQUISITES',
  OPEN_DETAILS: 'OPEN_DETAILS',
  CLOSE_ALL: 'CLOSE_ALL',
  OPEN_MOBMENU: 'OPEN_MOBMENU',
  OPEN_CATALOGUE: 'OPEN_CATALOGUE',
  OPEN_AUTH_POPUP: 'OPEN_AUTH_POPUP',
  OPEN_RESTORE_POPUP: 'OPEN_RESTORE_POPUP',
}

//export const serverRenderClock = (isServer) => (dispatch) => {
//  return dispatch({
//    type: menusActionTypes.TICK,
//    light: !isServer,
//    ts: Date.now(),
//  })
//}

//export const startClock = () => (dispatch) => {
//  return setInterval(() => dispatch({ type: menusActionTypes.TICK, light: true, ts: Date.now() }), 1000)
//}

export const setAsideOpen = (open) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_ASIDE, openMobMenu: open })
}

export const setOpenProfile = (open) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_PROFILE, openProfile: open })
}

export const setOpenRequisites = (requisites) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_REQUISITES, openRequisites: requisites })
}

export const setOpenDetails = (details) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_DETAILS, openDetails: details })
}

export const setOpenMobMenu = (open) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_MOBMENU, openMobMenu: open })
}

export const setOpenCatalogue = (open) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_CATALOGUE, openCatalogue: open })
}

export const setOpenResetPassword = (open) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_RESTORE_POPUP, openResetPassword: open })
}

export const setOpenAuthPopup = (open) => (dispatch) => {
  return dispatch({ type: menusActionTypes.OPEN_AUTH_POPUP, openAuthPopup: open })
}

export const setCloseAllMenus = () => (dispatch) => {
  return dispatch({ type: menusActionTypes.CLOSE_ALL })
}

//export const setOpenMobMenu = (open) => {
//  return { type: types.OPEN_MOBMENU, payload: { openMobMenu: open } }
//}
