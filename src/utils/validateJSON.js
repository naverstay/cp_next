/**
 * Валидация JSON
 *
 * @param str
 *
 * @returns {boolean}
 */

export const validateJSON = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
