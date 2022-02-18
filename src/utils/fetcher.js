import apiGET from '@/utils/search'

export const fetcher = (...args) => {
  return new Promise((resolve, reject) => {
    apiGET(args[0].url, args[0].options, (data) => {
      if (data.error) {
        resolve({ title: 'Ошибка', content: '' })
      } else {
        resolve(data)
      }
    })
  })
}
