import axios from 'axios'

const CancelToken = axios.CancelToken
const API = 'https://dev.catpart.ru/api'
let cancel

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  if (response.status === 204 || response.status === 205) {
    return null
  }
  return response.data
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  const error = new Error(response.statusText)
  error.response = response
  throw error
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url          The URL we want to request
 * @param  {object} data         The form data
 * @param  {object} [options]    The options we want to pass to "fetch"
 * @param  {function} cb         The callback function
 * @param  {json} content-type   The json content-type
 *
 * @return {object}           The response data
 */

export default function apiPOST(url, data, options, cb, json = false) {
  let headers = {
    'Content-Type': json ? 'application/json' : 'multipart/form-data',
  }

  if (typeof window !== 'undefined') {
    headers.Authorization = `Bearer ${localStorage.getItem('access_token') || ''}`
  }

  return axios
    .post(API + url, data, {
      headers: headers,
      data: data,
      params: options,
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c
      }),
    })
    .then(checkStatus)
    .then(parseJSON)
    .then((data) => {
      cancel = null

      if (typeof cb === 'function') {
        cb(data)
      }
    })
    .catch((e) => {
      if (typeof cb === 'function') {
        cb({ error: e })
      }
    })
}
