import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import FilterForm from '@/components/FilterForm'

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
      {/*<FilterForm*/}
      {/*    apiGETBridge={apiGETBridge}*/}
      {/*    sendSearchRequest={sendSearchRequest}         */}
      {/*    setErrorPage={setErrorPage}*/}
      {/*    prevRequest={prevRequest}*/}
      {/*    setPrevRequest={setPrevRequest}*/}
      {/*    setCategoryItems={setCategoryItems}*/}
      {/*    nestedCategories={nestedCategories}*/}
      {/*    setNestedCategories={setNestedCategories}*/}
      {/*    profile={profile}*/}

      {/*    categoryItems={categoryItems}*/}
      {/*    currency={currency}*/}
      {/*    setCurrency={setCurrency}*/}
      {/*    currencyList={currencyList}*/}
      {/*    setCurrencyList={setCurrencyList}*/}
      {/*    setOpenAuthPopup={setOpenAuthPopup}*/}
      {/*    setShowTableHeadFixed={setShowTableHeadFixed}*/}
      {/*    setOrderSent={setOrderSent}*/}
      {/*    totalCart={totalCart}*/}
      {/*    updateCart={updateCart}*/}
      {/*    notificationFunc={createNotification}*/}
      {/*    setOpenCatalogue={setOpenCatalogue}*/}
      {/*    setOpenMobMenu={setOpenMobMenu}*/}
      {/*    searchData={searchData}*/}
      {/*    showResults={!formBusy}*/}
      {/*    onSubmitSearchForm={onSubmitSearchForm}*/}
      {/*    props={{ ...props }}*/}
      {/*/>*/}
    </React.Fragment>
  )
}
