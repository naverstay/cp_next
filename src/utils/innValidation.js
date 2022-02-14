/**
 * Requests a URL, returning a promise
 *
 * @param  {string} query                  The INN we want to validate
 * @param  {function} successCallback      Success callback
 * @param  {function} failCallback         Fail callback
 *
 * @return {object}           The response data
 */

export default function innValidation(query, successCallback, failCallback) {
  let url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party'
  let token = 'd0b8126604dc16ceb56d30ea818730e172f4d025'

  //query = '7707083893';

  let options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Token ' + token,
    },
    body: JSON.stringify({ query: query }),
  }

  fetch(url, options)
    .then((response) => response.text())
    .then((result) => {
      successCallback(JSON.parse(result))
    })
    .catch((error) => {
      failCallback(error)
    })
}
