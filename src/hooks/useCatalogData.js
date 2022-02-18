import { useState } from 'react'

import apiGET from '@/utils/search'

export default function useCounter() {
  const [count, setCount] = useState(0)
  const increment = () => setCount((count) => count + 1)
  const decrement = () => setCount((count) => count - 1)

  return { count, increment, decrement }
}

export async function getCategoryList(category, attributes, catPage, catPageLimit, categorySortField, categorySortAsc) {
  let catColumnNames = []
  let categoryItems = []
  let searchData = []
  let catColumnsList = []
  let breadcrumbs = []
  let pagination = null
  let nestedCategories = []
  let categoryPage = false
  let itemData = null
  let categoryInfo = null
  let error = null
  let nodataText = ''

  if (
    attributes &&
    attributes.hasOwnProperty('a') &&
    typeof attributes.a === 'object' &&
    !Array.isArray(attributes.a)
  ) {
    attributes.a = Object.keys(attributes.a).map((k) => attributes.a[k])
  }

  const requestURL = ('/catalog/' + category).replace(/\/$/, '')

  let options = {
    page: catPage || 1,
    limit: catPageLimit || 10,
  }

  if (attributes && attributes.hasOwnProperty('a')) {
    options.attributes = attributes.a
      .filter((f) => !(f.id === 'm' || f.id === 'l'))
      .map((m) => {
        return {
          id: m.id,
          values: m.v,
        }
      })

    let manufacturer = attributes.a.find((f) => f.id === 'm')

    if (manufacturer) {
      options.manufacturer = manufacturer.v
    }
  }

  if (attributes && attributes.hasOwnProperty('m')) {
    options.manufacturer = attributes.m
  }

  if (categorySortField) {
    options.sort = {
      [categorySortField]: categorySortAsc ? 'asc' : 'desc',
    }
  }

  console.log('fetchingPage', requestURL, options)

  await apiGET(requestURL, options, (data) => {
    if (data.error) {
      console.log('NO DATA', requestURL, data.error)
      error = data.error
    } else {
      if (data.hasOwnProperty('product')) {
        categoryPage = false
        itemData = data.product

        if (data.hasOwnProperty('histories') && data.histories.res) {
          searchData = data.histories
        }
      } else if (data.hasOwnProperty('items')) {
        categoryPage = true
        itemData = null

        let items = []
        if (data.items.length) {
          data.items.forEach((d, di) => {
            let params = {}

            if (d.snippet.specs && d.snippet.specs.length) {
              d.snippet.specs.forEach((s, si) => {
                catColumnNames.push({
                  attributeId: s.attribute.id || 'no_id_' + di,
                  accessor: s.attribute.name,
                })
                params[s.attribute.name] = s.display_value
              })
            }

            items.push({
              catImage: d.image || '',
              catPartLink: d.slug || '',
              catPartNum: d.title || '!title!',
              catManufacturer: d.snippet.manufacturer.name || '!manufacturer!',
              ...params,
            })
          })
        } else {
          categoryItems = []
          nodataText = `Нет данных ${category} страница ${catPage} лимит ${catPageLimit}`
        }

        catColumnsList = catColumnNames.reduce((acc, c) => {
          if (acc.findIndex((a) => a.attributeId === c.attributeId) === -1) {
            return acc.concat(c)
          } else {
            return acc
          }
        }, [])

        categoryItems = items
      } else {
        nodataText = `Что-то пошло не так и не туда ${category} страница ${catPage} лимит ${catPageLimit}`
      }

      if (data.hasOwnProperty('category')) {
        categoryInfo = data.category
      }

      if (data.hasOwnProperty('breadcrumbs')) {
        breadcrumbs = data.breadcrumbs
      }

      if (data.hasOwnProperty('pagination') && data.pagination.pages) {
        pagination = data.pagination
      }

      if (data.hasOwnProperty('nestedCategories') && data.nestedCategories.length) {
        nestedCategories = data.nestedCategories.slice(0)
      } else {
        nestedCategories = []
      }
    }
  })

  return {
    catPage,
    categoryItems,
    searchData,
    catColumnsList,
    breadcrumbs,
    pagination,
    nestedCategories,
    categoryPage,
    itemData,
    categoryInfo,
    nodataText,
    error,
  }
}
