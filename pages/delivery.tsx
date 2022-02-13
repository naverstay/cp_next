import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import FeaturePage from '@/components/FeaturePage'

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

      <p>delivery.tsx</p>

      {/*<FeaturePage*/}
      {/*  setTableHeadFixed={setTableHeadFixed}*/}
      {/*  updateCart={updateCart}*/}
      {/*  notificationFunc={createNotification}*/}
      {/*  setOrderSent={setOrderSent}*/}
      {/*  totalCart={totalCart}*/}
      {/*  currency={currency}*/}
      {/*  setOpenCatalogue={setOpenCatalogue}*/}
      {/*  setOpenMobMenu={setOpenMobMenu}*/}
      {/*  {...routeProps}*/}
      {/*/>*/}
    </React.Fragment>
  )
}
