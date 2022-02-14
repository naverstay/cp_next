import axios from 'axios'

const { CancelToken } = axios
export const API = 'https://dev.catpart.ru/api'
const API2 = 'https://dev.sibelcom.tech/apiv2'
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
  return response
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
 *
 * @return {object}           The response data
 */

export default function apiORDER(url, data, options, cb) {
  // if (typeof cancel === 'function' && url.indexOf('search') > -1) {
  //  cancel();
  //  cancel = null;
  //
  //  if (typeof cb === 'function') {
  //    cb([]);
  //  }
  //

  // }

  return axios({
    method: 'post',
    url: API2 + url,
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
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

export function apiORDERDB(url, data, options, cb) {
  // if (typeof cancel === 'function' && url.indexOf('search') > -1) {
  //  cancel();
  //  cancel = null;
  //
  //  if (typeof cb === 'function') {
  //    cb([]);
  //  }
  //

  // }

  return axios({
    method: 'post',
    url: API + url,
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
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
