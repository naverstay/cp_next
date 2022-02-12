/**
 * Эффект счетчика от начального значения до конечного за заданный промежуток времени
 *
 * @param {array} arr
 * @param {number} val
 *
 * @returns {number}
 */
export const findPriceIndex = (arr, val) => {
  let ret = 0

  if (val >= arr[arr.length - 1].quant) {
    ret = arr.length - 1
  } else {
    arr.every((p, pi) => {
      if (pi) {
        if (val >= arr[pi - 1].quant && val < p.quant) {
          ret = pi - 1
          return false
        }
      }

      return true
    })
  }

  return ret
}
