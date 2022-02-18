/*
 * FeaturePage
 *
 * List all the features
 */

import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { useSelector } from 'react-redux'

import LoadingIndicator from '@/components/LoadingIndicator'
import { STATIC_PAGES } from '@/store/constants'

export default function FeaturePage(props) {
  const router = useRouter()
  const { id, slug } = router.query
  let data = props.pageData

  const { fetchingDataInProgress } = useSelector((state) => state.search)

  if (STATIC_PAGES.indexOf(id) > -1) {
    if (fetchingDataInProgress) return <LoadingIndicator page={fetchingDataInProgress} />

    return data ? (
      <>
        <Head>
          <title>{data.title + ' - CATPART.RU'}</title>
          <meta name="description" content={data.title + ' - CATPART.RU'} />
          <meta name="keywords" content={data.title + ' - CATPART.RU'} />
          <link rel="canonical" href={'https://catpart.ru/' + props.pageName + '/'} />
        </Head>
        <div className="row">
          <div className="column sm-col-12 xl-col-9">
            <article className="article">
              <h1 className="article-title">{data.title}</h1>

              <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </article>
          </div>
        </div>
      </>
    ) : null
  }

  return <p>page {id}</p>
}
