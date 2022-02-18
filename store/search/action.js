export const searchActionTypes = {
  FORM_BUSY: 'FORM_BUSY',
  FETCHING_DATA: 'FETCHING_DATA',
  TABLE_HEAD: 'TABLE_HEAD',
  CATALOG_MENU: 'CATALOG_MENU',
}

export const setFormBusy = (busy) => (dispatch) => {
  return dispatch({ type: searchActionTypes.FORM_BUSY, formBusy: busy })
}

export const setTableHeadFixed = (head) => (dispatch) => {
  return dispatch({ type: searchActionTypes.TABLE_HEAD, tableHeadFixed: head })
}

export const setCatalogMenu = (menu) => (dispatch) => {
  return dispatch({ type: searchActionTypes.CATALOG_MENU, catalogMenu: menu })
}

export const setFetchingDataInProgress = (fetching) => (dispatch) => {
  return dispatch({ type: searchActionTypes.FETCHING_DATA, fetchingDataInProgress: fetching })
}
