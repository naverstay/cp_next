/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import Head from 'next/head'
import React from 'react'

export default function NotFound(props) {
  return (
    <>
      <Head>
        <title>404</title>
        <meta name="description" content="404" />
        <meta name="keywords" content="404" />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <article className="article text-center __lg">
        <h1 className="article-title">404!</h1>
        <p>Такой страницы нет. Воспользуйтесь навигацией или поиском.</p>
      </article>
    </>
  )
}
