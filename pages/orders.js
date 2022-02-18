import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { OrdersPage } from '@/components/OrdersPage'
import { getCategoryMenu, getCurrencyAndMenu, getCurrencyList } from '@/hooks/useCatalogMenu'

function Page({ ...props }) {
  const router = useRouter()

  console.log('orders', props)
  return (
    <React.Fragment>
      <Head>
        <title>Поиск электронных компонентов - CATPART.RU</title>
        <meta name="description" content="Поиск электронных компонентов - CATPART.RU" />
        <meta name="keywords" content="Поиск электронных компонентов - CATPART.RU" />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <OrdersPage activeTab={0} {...props} />
    </React.Fragment>
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

export default Page
