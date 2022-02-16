import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { OrdersPage } from '@/components/OrdersPage'

function RoutePage({ ...props }) {
  const router = useRouter()

  console.log('catalog', props)

  return (
    <React.Fragment>
      <Head>
        <title>Поиск электронных компонентов - CATPART.RU</title>
        <meta name="description" content="Поиск электронных компонентов - CATPART.RU" />
        <meta name="keywords" content="Поиск электронных компонентов - CATPART.RU" />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <p>catalog {router.query?.page || '#'}</p>
    </React.Fragment>
  )
}

// This gets called on every request
export async function getServerSideProps({ req, res, route, query }) {
  // Fetch data from external API
  //const res = await fetch(`https://.../data`)
  //const data = await res.json()

  const page = req.url.split('/')[1]
  const pID = query?.page || ''

  //if (!data) {
  //  return {
  //    notFound: true,
  //  }
  //}

  //if (page === 'catalog') {
  //  if (!(parseInt(pID) > 1)) {
  //    console.log('getServerSideRedirect')
  //    return {
  //      redirect: {
  //        permanent: false,
  //        destination: '/catalog',
  //      },
  //    }
  //  }
  //} else if (pID) {
  //  console.log('getServerSideRedirect', pID)
  //  return {
  //    redirect: {
  //      permanent: false,
  //      destination: '/catalog',
  //    },
  //  }
  //}

  console.log('getServerSideProps', page, pID, route)

  // Pass data to the page via props
  return { props: { data: 123 } }
}

export default RoutePage
