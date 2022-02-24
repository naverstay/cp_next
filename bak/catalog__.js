import { useRouter } from 'next/router'
import React from 'react'

import OrdersPage from '@/components/OrdersPage'
import { getCategoryList } from '@/hooks/useCatalogData'
import { getCurrencyAndMenu } from '@/hooks/useCatalogMenu'
import { STATIC_PAGES } from '@/store/constants'

const CatalogPage = ({ ...props }) => {
  const router = useRouter()
  const { id, slug } = router.query

  console.log('CatalogPage')

  if (props.catalogData) {
    return <OrdersPage activeTab={0} {...props} catalogData={props.catalogData} />
  }

  return (
    <>
      <p>any</p>
      <h2>{id}</h2>
      <h2>{slug?.join(' / ')}</h2>
    </>
  )
}

export async function getServerSideProps({ query, res }) {
  const { id, slug } = query
  let pageData = {}
  let catalogData = {}
  let errorCode = false

  //if (slug?.length) {
  //  let redirectTo = ''
  //
  //  if (slug.length > 1) {
  //    redirectTo = `/${id}/${slug[0]}/`
  //  }
  //
  //  if (isNaN(slug[0]) || Number(slug[0]) <= 1) {
  //    redirectTo = `/${id}/`
  //  }
  //
  //  if (slug.length > 0 && id !== 'catalog') {
  //    redirectTo = '/catalog/'
  //  }
  //
  //  if (redirectTo) {
  //    res.statusCode = 302
  //    res.setHeader('Location', redirectTo)
  //  }
  //}

  if (STATIC_PAGES.indexOf(id) > -1) {
    //pageData = await new Promise((resolve, reject) => {
    //  apiGET('/pages?url=/' + id, {}, (data) => {
    //    if (data.error) {
    //      resolve({ title: 'Ошибка', content: '', error: data.error })
    //    } else {
    //      resolve(data)
    //    }
    //  })
    //})
    //
    //if (pageData.error) {
    //  errorCode = 404
    //}

    console.log('pageData', id, res)
  } else if (id === 'catalog') {
    //errorCode = 404

    console.log('load catalog', query, slug, errorCode)

    catalogData = await new Promise((resolve, reject) => {
      resolve(getCategoryList('', query, slug || 1, query?.l || 10, '', 'asc', ''))
    })
  } else if (STATIC_PAGES.indexOf(id) === -1) {
    // check any page
    console.log('load page', query, slug)

    //catalogData = await new Promise((resolve, reject) => {
    //  resolve(getCategoryList(id, query, slug || 1, query?.l || 10, '', 'asc', ''))
    //})
  }

  if (catalogData.error) {
    errorCode = 404
  }

  const { catalogMenu, currencyList } = await getCurrencyAndMenu()

  return {
    notFound: !!errorCode,
    props: {
      pageData: pageData,
      errorCode: errorCode,
      catalogData: catalogData,
      catalogMenu: catalogMenu,
      currencyList: currencyList,
    },
  }
}

export default CatalogPage
