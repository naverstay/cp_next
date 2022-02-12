/**
 * Валидация JSON
 *
 * @param array
 *
 * @returns []
 */

export const flatDeep = (array) => {
  let ret = []
  ;(function flat(array) {
    array.forEach(function (el) {
      ret.push(el.slug)
      if (Array.isArray(el.children)) {
        flat(el.children)
      }
    })
  })(array)
  return ret
}
