/**
 * Валидация json
 *
 * @param str
 *
 * @returns {object}
 */

export const getJsonData = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return {}
  }
  return JSON.parse(str)
}
