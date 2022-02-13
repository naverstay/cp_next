/*
 * FeaturePage
 *
 * List all the features
 */
import { useAtom } from 'jotai'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'

import apiGET from '../../utils/search'

import { openCatalogueJotai, tableHeadFixedJotai } from '@/store/store'

export default function FeaturePage(props) {
  const [page, setPage] = useState(null)
  const [tableHeadFixed, setTableHeadFixed] = useAtom(tableHeadFixedJotai)
  const [openCatalogue, setOpenCatalogue] = useAtom(openCatalogueJotai)

  useEffect(() => {
    setTableHeadFixed(null)

    if (!page || page.url !== props.match.path) {
      const requestURL = '/pages?url=' + props.match.path
      setOpenCatalogue(false)

      apiGET(requestURL, {}, (data) => {
        if (data.error) {
          setPage({ title: 'Ошибка', content: '' })
        } else {
          setPage(data)
        }
      })
    }
  }, [props])

  return page ? (
    <>
      <Head>
        <title>{page.title + ' - CATPART.RU'}</title>
        <meta name="description" content={page.title + ' - CATPART.RU'} />
        <meta name="keywords" content={page.title + ' - CATPART.RU'} />
        <link rel="canonical" href={'https://catpart.ru' + props.match.path + '/'} />
      </Head>
      <div className="row">
        <div className="column sm-col-12 xl-col-9">
          <article className="article">
            <h1 className="article-title">{page.title}</h1>

            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        </div>
      </div>
    </>
  ) : null
}
