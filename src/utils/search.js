import axios from 'axios'
import qs from 'qs'

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
 * @param  {string} url         The URL we want to request
 * @param  {object} [options]   The options we want to pass to "fetch"
 * @param  {function} cb        The callback function
 *
 * @return {object}             The response data
 */

export default function apiGET(url, options, cb, attr = '') {
  let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (typeof window !== 'undefined') {
    headers.Authorization = `Bearer ${localStorage.getItem('access_token') || ''}`
  }

  return axios(API + url + attr, {
    headers: headers,
    data: {},
    params: options,
    paramsSerializer: (params) => {
      return qs.stringify(params)
    },
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
