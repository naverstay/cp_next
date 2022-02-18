import Error from 'next/error'
import React from 'react'

import NotFoundPage from '@/components/NotFoundPage'
import { getCurrencyAndMenu } from '@/hooks/useCatalogMenu'

export default function Custom404(props) {
  return <NotFoundPage {...props} />
}

export async function getStaticProps() {
  const { catalogMenu, currencyList } = await getCurrencyAndMenu()

  return {
    props: { catalogMenu: catalogMenu, currencyList: currencyList },
  }
}
