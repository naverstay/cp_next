import apiGET from './search'

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} email                  The email we want to validate
 * @param  {function} successCallback      Success callback
 * @param  {function} failCallback         Fail callback
 *
 * @return {object}           The response data
 */

export default function checkEmailExist(email, successCallback, failCallback) {
  const requestURL = '/auth/exists?email=' + email

  apiGET(requestURL, {}, (data) => {
    if (data.error) {
      failCallback(data.error)
    } else {
      successCallback(data)
    }
  })
}
