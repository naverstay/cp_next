import { RUB } from '@/store/constants'
import apiGET from '@/utils/search'

export async function getCategoryMenu() {
  let menu = []

  const requestURL = '/catalog/categories'

  await apiGET(requestURL, {}, (data) => {
    if (data && data.length) {
      menu = data
    }
  })

  return menu
}

export async function getCurrencyList() {
  let currencyList = []

  const requestURL = '/currencies'

  await apiGET(requestURL, {}, (data) => {
    if (data && Object.keys(data).length) {
      currencyList = Object.keys(data)
        .map((c) => ({
          name: c,
          precision: 4,
          exChange: parseFloat(data[c]),
        }))
        .concat(RUB)
    }
  })

  return currencyList
}

export async function getCurrencyAndMenu() {
  let catalogMenu = await new Promise((resolve, reject) => {
    let categories = getCategoryMenu()

    if (categories.error) {
      resolve({})
    }

    resolve(categories)
  })

  let currencyList = await new Promise((resolve, reject) => {
    let categories = getCurrencyList()

    if (categories.error) {
      resolve([])
    }

    resolve(categories)
  })

  return { catalogMenu, currencyList }
}
