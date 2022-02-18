import { searchActionTypes } from './action'

const searchInitialState = {
  formBusy: false,
  tableHeadFixed: null,
  fetchingDataInProgress: '',
  catalogMenu: [],
}

export default function reducer(state = searchInitialState, action) {
  switch (action.type) {
    case searchActionTypes.FORM_BUSY:
      return Object.assign({}, state, {
        formBusy: action.formBusy,
      })
    case searchActionTypes.FETCHING_DATA:
      return Object.assign({}, state, {
        fetchingDataInProgress: action.fetchingDataInProgress,
      })
    case searchActionTypes.CATALOG_MENU:
      return Object.assign({}, state, {
        catalogMenu: action.catalogMenu,
      })
    case searchActionTypes.TABLE_HEAD:
      return Object.assign({}, state, {
        tableHeadFixed: action.tableHeadFixed,
      })
    default:
      return state
  }
}
