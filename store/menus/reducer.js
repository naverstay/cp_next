import { menusActionTypes } from './action'

const menusInitialState = {
  openAuthPopup: false,
  openResetPassword: false,
  openCatalogue: false,
  openMobMenu: false,
  openProfile: false,
  openRequisites: 0,
  openDetails: 0,
  asideOpen: false,
}

export default function reducer(state = menusInitialState, action) {
  switch (action.type) {
    case menusActionTypes.CLOSE_ALL:
      return menusInitialState
    case menusActionTypes.OPEN_ASIDE:
      return Object.assign({}, state, {
        asideOpen: !!action.asideOpen,
      })
    case menusActionTypes.OPEN_PROFILE:
      return Object.assign({}, menusInitialState, {
        openProfile: !!action.openProfile,
        asideOpen: !!action.openProfile,
      })
    case menusActionTypes.OPEN_REQUISITES:
      return Object.assign({}, menusInitialState, {
        openRequisites: action.openRequisites,
        asideOpen: !!action.openRequisites,
      })
    case menusActionTypes.OPEN_DETAILS:
      return Object.assign({}, menusInitialState, {
        openDetails: action.openDetails,
        asideOpen: !!action.openDetails?.id,
      })
    case menusActionTypes.OPEN_MOBMENU:
      return Object.assign({}, menusInitialState, {
        openMobMenu: !!action.openMobMenu,
      })
    case menusActionTypes.OPEN_CATALOGUE:
      return Object.assign({}, menusInitialState, {
        openCatalogue: !!action.openCatalogue,
      })
    case menusActionTypes.OPEN_AUTH_POPUP:
      return Object.assign({}, menusInitialState, {
        openAuthPopup: !!action.openAuthPopup,
      })
    case menusActionTypes.OPEN_RESTORE_POPUP:
      return Object.assign({}, menusInitialState, {
        openResetPassword: !!action.openResetPassword,
      })
    default:
      return state
  }
}
