import XLSX from 'xlsx'

import dateFormatter from './dateFormatter'
import { findPriceIndex } from './findPriceIndex'
import priceFormatter from './priceFormatter'

const MODE_CART = 0
const MODE_BOM = 1
const MODE_DETAILS = 2
const MODE_SEARCH = -1

const transformSearchData = (data, query) =>
  data.reduce(
    (arr, c) =>
      arr.concat(
        c.hasOwnProperty('data')
          ? c.data.map((d) => {
              if (query) {
                d.query = c.q
              }
              return d
            })
          : []
      ),
    []
  )

const prepareJSON = (data, mode, currency) => {
  if (mode !== MODE_CART && mode !== MODE_DETAILS) {
    data = transformSearchData(data, mode === MODE_BOM)
  }

  return data.map((row) => {
    let price = ''
    let priceMatch = -1

    if (mode === MODE_CART) {
      priceMatch = findPriceIndex(row.pricebreaks, row.cart)
      price = priceFormatter(
        row.cart * parseFloat(row.pricebreaks[priceMatch].price / currency.exChange).toFixedCustom(currency.precision),
        currency.precision
      )
      row.price = `${priceMatch}#${price}`
    } else {
      delete row.cart
    }

    if (mode === MODE_DETAILS) {
      row.calculated_delivery_date = dateFormatter(row.calculated_delivery_date)
      row.real_delivery_date = dateFormatter(row.real_delivery_date)
      row.sum = priceFormatter(row.quantity * row.price)
      row.statuses = row.statuses.map((p) => `${p.name} - ${dateFormatter(p.updated_at)}`).join('\n')
    } else {
      row.pricebreaks = row.pricebreaks
        .map((p) => `${p.quant} - ${priceFormatter(p.price / currency.exChange, currency.precision)}`)
        .join('\n')
      row.currency = currency.name
    }

    delete row.id
    delete row.cur
    delete row.bold
    delete row.request
    delete row.currentPricebreak

    return row
  })
}

export const xlsDownload = (data, currency, mode) => {
  if (data && data.length) {
    let fileName = mode === MODE_CART ? 'cart' : 'search'

    let tableHeader = [
      'supplier',
      'name',
      'manufacturer',
      'quantity',
      'pack_quant',
      'price_unit',
      'moq',
      'delivery_period',
    ]

    if (mode === MODE_CART) {
      tableHeader.push('cart')
    }

    tableHeader.push('pricebreaks')

    if (mode === MODE_CART) {
      tableHeader.push('price')
    }

    tableHeader.push('currency')

    if (mode === MODE_BOM) {
      tableHeader = ['query', ...tableHeader]
    }

    if (mode === MODE_DETAILS) {
      fileName = 'details'
      tableHeader = [
        'name',
        'supplier',
        'manufacturer',
        'quantity',
        'price',
        'sum',
        'statuses',
        'calculated_delivery_date',
        'real_delivery_date',
        'comment',
      ]
    }

    let WS = XLSX.utils.json_to_sheet(prepareJSON(JSON.parse(JSON.stringify(data)), mode, currency), {
      header: tableHeader,
    })

    if (mode === MODE_CART) {
      const newJSON = XLSX.utils.sheet_to_json(WS)

      Object.keys(newJSON).map((j) => {
        const row = newJSON[j]
        const priceMatch = row.price.split('#')
        const space = '\n'.repeat(+priceMatch[0])
        row.currency = space + row.currency
        row.cart = space + row.cart
        row.price = space + priceMatch[1]
      })

      WS = XLSX.utils.json_to_sheet(newJSON, { header: tableHeader })
    }

    const WB = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(WB, WS, fileName)

    XLSX.writeFile(WB, `${fileName}.xls`)
  }
}
