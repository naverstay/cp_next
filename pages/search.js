import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import FilterForm from '@/components/FilterForm'

export default function SearchPage({ ...pageProps }) {
  const router = useRouter()

  const { apiGETBridge, createNotification, onSubmitSearchForm, updateCart } = pageProps

  return (
    <React.Fragment>
      <Head>
        <title>Поиск электронных компонентов - CATPART.RU</title>
        <meta name="description" content="Поиск электронных компонентов - CATPART.RU" />
        <meta name="keywords" content="Поиск электронных компонентов - CATPART.RU" />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <FilterForm
        updateCart={updateCart}
        apiGETBridge={apiGETBridge}
        createNotification={createNotification}
        onSubmitSearchForm={onSubmitSearchForm}
      />
    </React.Fragment>
  )
}
