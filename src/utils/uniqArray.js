/**
 * Валидация JSON
 *
 * @param array
 *
 * @returns []
 */

export const uniqArray = (array) => {
  return array.filter(function (item, pos, self) {
    let ret = self.indexOf(item) === pos
    if (!ret) {
      //console.log('WARN DUPLICATE', item, pos)
    }
    return ret
  })
}
