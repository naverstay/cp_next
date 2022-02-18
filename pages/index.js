import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { getCategoryList } from '@/hooks/useCatalogData'
import { getCategoryMenu, getCurrencyAndMenu, getCurrencyList } from '@/hooks/useCatalogMenu'
import { STATIC_PAGES } from '@/store/constants'
import apiGET from '@/utils/search'

function IndexPage(props) {
  const history = useRouter()

  console.log('IndexPage', props, history)

  return (
    <Head>
      <title>Поиск электронных компонентов - CATPART.RU</title>
      <meta name="description" content="Поиск электронных компонентов - CATPART.RU" />
      <meta name="keywords" content="Поиск электронных компонентов - CATPART.RU" />
      <link rel="canonical" href="https://catpart.ru/" />
    </Head>
  )
}

export async function getServerSideProps({ query, res }) {
  const { catalogMenu, currencyList } = await getCurrencyAndMenu()

  return {
    props: {
      currencyList: currencyList,
      catalogMenu: catalogMenu,
    },
  }
}

export default IndexPage
