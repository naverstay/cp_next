import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import FilterForm from '@/components/FilterForm'
import { getCategoryMenu, getCurrencyAndMenu, getCurrencyList } from '@/hooks/useCatalogMenu'
import { getSearchList } from '@/hooks/useCatalogSearch'

function SearchPage({ ...props }) {
  const router = useRouter()

  console.log('SearchPage', props)

  return (
    <React.Fragment>
      <Head>
        <title>Поиск электронных компонентов - CATPART.RU</title>
        <meta name="description" content="Поиск электронных компонентов - CATPART.RU" />
        <meta name="keywords" content="Поиск электронных компонентов - CATPART.RU" />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <FilterForm {...props} />
    </React.Fragment>
  )
}

export async function getServerSideProps({ query, res }) {
  const { q, art } = query
  let searchData = {}
  let errorCode = false

  if (art?.length) {
    searchData = await new Promise((resolve, reject) => {
      resolve(getSearchList(art, q || 1))
    })
    if (searchData.error) {
      errorCode = 404
    }
  }

  const { catalogMenu, currencyList } = await getCurrencyAndMenu()

  return {
    notFound: !!errorCode,
    props: {
      errorCode: errorCode,
      currencyList: currencyList,
      searchData: searchData,
      catalogMenu: catalogMenu,
    },
  }
}

export default SearchPage
