import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

export default function IndexPage(props) {
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
