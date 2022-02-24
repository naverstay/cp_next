/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import Head from 'next/head'
import Image from 'next/image'
import qs from 'qs'
import React, { useEffect, useMemo, useState } from 'react'
//import Swiper from 'react-id-swiper'
import Ripples from 'react-ripples'
import { SlideDown } from 'react-slidedown'
//import { Navigation, Manipulation } from 'swiper'

import FormCheck from '../../components/FormCheck'
import NoImage from '../../images/no-image.png'

import NextLink from '@/components/NextLink'

export default function CatalogueItem(props) {
  const { itemData } = props

  const snippetCheckData =
    itemData && itemData.hasOwnProperty('snippet') && itemData.snippet.specs && itemData.snippet.specs.length
      ? itemData.snippet.specs.map((m) => m.attribute.id)
      : []
  const [snippetCheckValue, setSnippetCheckValue] = useState([])
  const [analogLink, setAnalogLink] = useState('')
  const [openMoreSpecs, setOpenMoreSpecs] = useState(false)

  const handleCheckAll = (target) => {
    return setSnippetCheckValue(target.target.value ? snippetCheckData : [])
  }

  const handleChange = (value, target) => {
    let newVal = snippetCheckValue.slice(0)

    if (value === void 0) {
      console.log('no value', value, target)
      return false
    } else {
      if (target.target.value) {
        newVal.push(value)
      } else {
        let index = snippetCheckValue.findIndex((f) => f === value)
        newVal.splice(index, 1)
      }

      return setSnippetCheckValue(newVal)
    }
  }

  let title = itemData.hasOwnProperty('snippet') ? itemData.snippet.name || '' : ''

  useEffect(() => {
    const params = itemData.snippet.specs
      .filter((s) => {
        return snippetCheckValue.indexOf(s.attribute.id) > -1 && s.display_value.length > 0
      })
      .map((m) => {
        return {
          id: m.attribute.id,
          v: [m.display_value],
        }
      })

    console.log('params', params, qs.parse(qs.stringify({ a: params })))

    if (params.length) {
      setAnalogLink('/catalog/?' + qs.stringify({ a: params }))
    } else {
      setAnalogLink('')
    }
  }, [snippetCheckValue])

  const watchSpecs = itemData?.snippet?.specs || []

  const specsHTML = useMemo(() => {
    const specsLimit = openMoreSpecs || typeof window === 'undefined' ? itemData.snippet.specs.length : 10

    return (
      <div className="catalogue-page__specs-wrapper">
        {itemData.snippet.specs.slice(0, specsLimit).map((s, si) => {
          return (
            <div key={si} className={'catalogue-page__analogue-param ' + (si % 2 === 0 ? '__odd' : '__even')}>
              <FormCheck
                onChange={handleChange.bind(this, s.attribute.id)}
                checked={snippetCheckValue.indexOf(s.attribute.id) > -1}
                id={s.attribute.id}
                name={s.attribute.id}
                value={s.display_value}
                error={null}
                label={''}
                inputRef={null}
              />
              <span>{s.hasOwnProperty('attribute') && (s.attribute.name || s.attribute.id || '')}</span>
              <span>{s.display_value}</span>
            </div>
          )
        })}
      </div>
    )
  }, [watchSpecs])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta name="keywords" content={title} />
        <link rel="canonical" href="https://catpart.ru/" />
      </Head>

      <div itemScope itemType="http://schema.org/Product" className="catalogue-page__product">
        {itemData ? (
          <article className="article __catalogue">
            <h1 itemProp="name" className="article-title">
              {itemData.title}
            </h1>

            <div className={'catalogue-page__item'}>
              <div className="catalogue-page__item-image">
                <img itemProp="image" src={itemData.image || NoImage} alt="" />
              </div>
              {itemData.snippet && itemData.snippet.hasOwnProperty('id') ? (
                <dl className="catalogue-page__item-info">
                  {itemData.snippet.manufacturer ? (
                    <div className={'description __col-mode'}>
                      <dt>
                        <b>Производитель:</b>
                      </dt>
                      <dd>{itemData.snippet.manufacturer.name || ''}</dd>
                    </div>
                  ) : null}

                  {itemData.snippet.best_datasheet && itemData.snippet.best_datasheet.url ? (
                    <div className={'description __ds-mode'}>
                      <dt>Datasheet:</dt>
                      <dd>
                        <a
                          target="_blank"
                          className="orders-chronology__link __red"
                          href={itemData.snippet.best_datasheet.url}
                          rel="noreferrer"
                        >
                          pdf
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {/*{itemData.snippet.sellers && itemData.snippet.sellers.length ?*/}
                  {/*  <div itemProp="offers" itemScope itemType="http://schema.org/Offer" className={"description"}>*/}
                  {/*    <dt><b>Поставщики:</b></dt>*/}
                  {/*    <dd>{itemData.snippet.sellers.reduce((acc, el) => `${acc + ", " + ((el.company && el.company.name) ? el.company.name : "")}`, "").substring(2)}</dd>*/}
                  {/*  </div> : null}*/}

                  {itemData.snippet.descriptions && itemData.snippet.descriptions.length ? (
                    <div itemProp="description" className={'description'}>
                      <dt className={'hide'}>
                        <b>Описание:</b>
                      </dt>
                      <dd>
                        {itemData.snippet.descriptions
                          .reduce((acc, el) => `${acc + '\n' + (el.text || '')}`, '')
                          .substring(1)}
                      </dd>
                    </div>
                  ) : null}
                  {/*<div className={"description"}>*/}
                  {/*  <dt><b>Аналоги:</b></dt>*/}
                  {/*  <dd></dd>*/}
                  {/*</div>*/}
                </dl>
              ) : null}
            </div>
          </article>
        ) : null}

        {itemData && itemData.hasOwnProperty('snippet') ? (
          <React.Fragment>
            {itemData.snippet.specs && itemData.snippet.specs.length ? (
              <>
                <article className="article __catalogue">
                  <p>Технические спецификации</p>
                </article>
                <div className={'catalogue-page__specs'}>
                  {typeof window === 'undefined' ? (
                    specsHTML
                  ) : (
                    <SlideDown transitionOnAppear={false}>{specsHTML}</SlideDown>
                  )}

                  <div className="catalogue-page__controls">
                    {itemData.snippet.specs.length > 10 && typeof window !== 'undefined' ? (
                      <Ripples
                        onClick={() => {
                          setOpenMoreSpecs(!openMoreSpecs)
                        }}
                        className={'btn dropdown-holder __gray' + (openMoreSpecs ? ' __opened' : '')}
                        during={1000}
                      >
                        <span className="btn-inner __name">
                          <span>Показать полностью</span>
                          <span className={'icon icon-chevron-up'} />
                        </span>
                      </Ripples>
                    ) : null}

                    {analogLink ? (
                      <NextLink to={analogLink} className="btn __blue">
                        <span className="btn-inner">Отфильтровать по заданному</span>
                      </NextLink>
                    ) : (
                      <span className="btn __gray">Отфильтровать по заданному</span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </React.Fragment>
        ) : null}
      </div>
    </>
  )
}
