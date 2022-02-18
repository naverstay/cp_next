import './../src/styles/app.scss'

import Router from 'next/router'
import React, { useEffect, useState } from 'react'

import { wrapper } from '../store/store'

import App from '@/components/App'
import { RUB } from '@/store/constants'

Number.prototype.toFixedCustom = function (decimals) {
  const base = Math.pow(10, decimals)
  // console.log('toFixedCustom', this, decimals, Math.round((this + Number.EPSILON) * base) / base);
  return Math.round((this + Number.EPSILON) * base) / base
}

function CatpartNextApp({ Component, pageProps }) {
  const { pageData, errorData, catalogData, searchData, catalogMenu, currencyList } = pageProps
  const [fetchingPage, setFetchingPage] = useState('')

  const loadingTrue = (evt) => {
    console.log('loadingTrue', evt)
    setFetchingPage(evt.split('/')[1])
  }
  const loadingFalse = (evt) => {
    console.log('loadingFalse', evt)
    setFetchingPage('')
  }

  useEffect(() => {
    Router.events.on('routeChangeStart', loadingTrue)
    Router.events.on('routeChangeComplete', loadingFalse)
    Router.events.on('routeChangeError', loadingFalse)

    return () => {
      Router.events.off('routeChangeStart', loadingTrue)
      Router.events.off('routeChangeComplete', loadingFalse)
      Router.events.off('routeChangeError', loadingFalse)
    }
  })

  console.log('pageProps _app', pageProps, fetchingPage)

  return (
    <App
      Component={Component}
      {...pageProps}
      errorData={errorData || null}
      currencyList={currencyList || [RUB]}
      pageData={pageData || null}
      searchData={searchData || null}
      catalogData={catalogData || null}
      catalogMenu={catalogMenu || null}
      fetchingPage={fetchingPage}
    />
  )
}

export default wrapper.withRedux(CatpartNextApp)
