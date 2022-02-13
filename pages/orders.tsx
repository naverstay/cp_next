import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { OrdersPage } from '@/components/OrdersPage'

export default function SearchPage({ ...pageProps }) {
  const router = useRouter()

  return (
    <React.Fragment>
      <Head>
        <title>Поиск электронных компонентов - CATPART.RU</title>
        <meta name="description" content="Поиск электронных компонентов - CATPART.RU" />
        <meta name="keywords" content="Поиск электронных компонентов - CATPART.RU" />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <p>OrdersPage 0</p>

      {/*<OrdersPage*/}
      {/*  activeTab={0}*/}
      {/*  profile={profile}*/}
      {/*  needLogin={needLogin}*/}
      {/*  requisitesList={requisitesList}*/}
      {/*  ordersList={ordersList}*/}
      {/*  currency={currency}*/}
      {/*  setOpenProfile={setOpenProfile}*/}
      {/*  setOpenRequisites={setOpenRequisites}*/}
      {/*  setOpenDetails={setOpenDetails}*/}
      {/*  history={history}*/}
      {/*  setTableHeadFixed={setTableHeadFixed}*/}
      {/*  {...routeProps}*/}
      {/*/>*/}
    </React.Fragment>
  )
}
