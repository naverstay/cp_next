import apiGET from '@/utils/search'

export async function getSearchList(art, c = 1) {
  let searchDataS = {}

  const requestURL = '/search'

  await apiGET(requestURL, { q: art, c: c }, (data) => {
    searchDataS = data
  })

  return {
    ...searchDataS,
  }
}
