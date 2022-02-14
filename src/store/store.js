import { atom } from 'jotai'

import { RUB } from '@/store/constants'

export const currencyJotai = atom(RUB)
export const currencyListJotai = atom([RUB])
export const categoryItemsJotai = atom([])
export const categorySlugLinksJotai = atom([])
export const itemSlugLinksJotai = atom([])
export const menuJsonJotai = atom([])
export const nestedCategoriesJotai = atom([])
export const prevRequestJotai = atom('')

export const tableHeadFixedJotai = atom(null)
export const showTableHeadFixedJotai = atom(false)
export const searchDataJotai = atom({})
export const openMobMenuJotai = atom(false)
export const openCatalogueJotai = atom(false)
export const orderSentJotai = atom(false)
export const searchCountJotai = atom(1)
export const cartCountJotai = atom(0)
export const totalCartJotai = atom(0)
export const globalPageStatusJotai = atom(200)
export const openAuthPopupJotai = atom(false)

export const searchResultJotai = atom(false)
export const appDragJotai = atom(false)

export const formBusyJotai = atom(false)
export const busyOrderJotai = atom(false)
export const errorPageJotai = atom(false)
export const profileCheckedJotai = atom(false)
export const profileJotai = atom({})

export const openProfileJotai = atom(false)
export const openRequisitesJotai = atom(0)
export const openDetailsJotai = atom(0)
export const asideOpenJotai = atom(false)
export const asideContentJotai = atom(null)
export const isAbove1500Jotai = atom(false)
export const isDevModeJotai = atom(false)
