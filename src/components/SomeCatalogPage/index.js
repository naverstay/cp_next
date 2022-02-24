/*
 * FilterForm
 *
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import qs from 'qs'
import React, { useEffect, memo, useState, useMemo } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { connect, useDispatch, useSelector } from 'react-redux'
import Ripples from 'react-ripples'

import { setOpenMobMenu } from '../../../store/menus/action'
import Breadcrumbs from '../Breadcrumbs'
import CatalogueItem from '../CatalogueItem'
import CataloguePage from '../CataloguePage'
import DeepElaboration from '../DeepElaboration'
import { OrderForm } from '../OrderForm'
import { SearchResults } from '../SearchResults'
import SimilarSlider from '../SimilarSlider'
import SupplyNotification from '../SupplyNotification'

import LoadingIndicator from '@/components/LoadingIndicator'
import { getCategoryList } from '@/hooks/useCatalogData'
import { RUB, TRIGGER_DROPDOWN_LIMIT } from '@/store/constants'
import { getJsonData } from '@/utils/getJsonData'
import { getButtonsMap } from '@/utils/getPaginationMap'
import apiGET from '@/utils/search'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import { xlsDownload } from '@/utils/xlsDownload'

dayjs.extend(relativeTime)

let counter = 0

export function SomeCatalogPage({
  notificationFunc,
  updateCart,
  sendSearchRequest,
  profile,
  errorPage,
  totalCart,
  setTableHeadFixed,
  searchData,
  setSearchData,
  currency,
  setCurrency,
  currencyList,
  setCurrencyList,
  setOpenAuthPopup,
  devMode,
  cartData,
  setCartData,
  catalogData,
  ...pageProps
}) {
  const history = useRouter()
  const dispatch = useDispatch()

  console.log('SomeCatalogPage', catalogData)

  const query = history.query

  const { formBusy, fetchingDataInProgress } = useSelector((state) => state.search)

  const cart = false
  const someCategoryUrl = true

  let actualTimer

  const params = history.query

  const pageLimitList = [
    // 1, 2, 3,
    10, 25, 50,
  ]

  const [categoryInfo, setCategoryInfo] = useState(pageProps?.categoryInfo || null)
  //const [currency, setCurrency] = useCurrency(pageProps?.pageProps || [])

  let querySort =
    params && params.hasOwnProperty('s')
      ? Object.keys(params.s).map((k) => {
          return {
            field: k,
            asc: params.s[k] === 'a',
          }
        })
      : [
          {
            field: '',
            asc: true,
          },
        ]

  let queryAttr =
    params && params.hasOwnProperty('a')
      ? params.a.map((m) => {
          return {
            id: m.id,
            values: m.v,
          }
        })
      : []

  if (params && params.hasOwnProperty('m')) {
    queryAttr.push({
      id: 'm',
      name: 'Производитель',
      values: params.m,
    })
  }

  const [categoryItems, setCategoryItems] = useState(catalogData?.categoryItems || [])
  const [categoryFilter, setCategoryFilter] = useState(queryAttr)
  const [categoryFilterNames, setCategoryFilterNames] = useState([])
  const [categorySortField, setCategorySortField] = useState(querySort.length ? querySort[0].field : '')
  const [categorySortAsc, setCategorySortAsc] = useState(querySort.length ? querySort[0].asc : true)

  const updateFilterNames = (options, ids) => {
    const requestURL = '/catalog/attributes'
    const filterNames = []

    let manufacturer = categoryFilter.find((f) => f.id === 'm')

    if (manufacturer) {
      filterNames.push({
        id: 'm',
        name: 'Производитель',
        values: manufacturer.values,
      })
    }

    if (ids.length && options.hasOwnProperty('a')) {
      if (prevRequestAttr !== requestURL + JSON.stringify(options)) {
        setPrevRequestAttr(requestURL + JSON.stringify(options))

        apiGET(requestURL, { ids: ids }, (data) => {
          setCategoryFilterNames(
            filterNames.concat(
              options.a.map((m) => {
                return {
                  id: m.id,
                  name: data[m.id],
                  values: m.v,
                }
              })
            )
          )
        })
      }
    } else {
      if (typeof window !== 'undefined') {
        setCategoryFilterNames(filterNames)
      }
    }
  }

  const [openPaginationDropdown, setOpenPaginationDropdown] = useState(false)

  const { openMobMenu } = useSelector((state) => state.menus)

  const openPaginationRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenPaginationDropdown(false)
    },
  })

  const [prevPageURL, setPrevPageURL] = useState('')
  const [prevRequestAttr, setPrevRequestAttr] = useState('')
  const [prevRequest, setPrevRequest] = useState('')

  const [searchInfo, setSearchInfo] = useState('')
  const [updateTime, setUpdateTime] = useState(false)
  const [categoryPage, setCategoryPage] = useState(catalogData?.categoryPage || false)
  const [nestedCategories, setNestedCategories] = useState(catalogData?.nestedCategories || [])
  const [pagination, setPagination] = useState(catalogData?.pagination || { pages: 1 })

  const [totalData, setTotalData] = useState(-1)
  const [scrollTriggers, setScrollTriggers] = useState([])
  const [elaboration, setElaboration] = useState([])

  const [openMoreTriggers, setOpenMoreTriggers] = useState(false)
  const [catColumnsList, setCatColumnsList] = useState(catalogData?.catColumnsList || [])

  const paramsLimit = params.hasOwnProperty('l') ? parseInt(params.l) : 10

  const [catPageLimit, setCatPageLimit] = useState(
    !isNaN(paramsLimit) && pageLimitList.indexOf(paramsLimit) > -1 ? paramsLimit : 10
  )
  const [pageLimitTrigger, setPageLimitTrigger] = useState(0)

  const [catPage, setCatPage] = useState(catalogData?.catPage || 1)
  const [categoryFilterTrigger, setCategoryFilterTrigger] = useState(0)

  const [noDataText, setNodataText] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState(catalogData?.breadcrumbs || [])
  const [itemData, setItemData] = useState(catalogData?.itemData || null)
  const [showCatPreloader, setShowCatPreloader] = useState(false)

  // todo get props from history
  const props = {
    match: {
      url: history.asPath,
      params: {
        catalogue: 'catalog',
        page: '2',
      },
    },
  }

  //console.log('SomeCatalogPage', params, paramsPage, history.asPath.split('/'))

  const isCatalogueRoot = () => {
    // todo match catalogue
    // props.match.params.hasOwnProperty('catalogue') &&
    return history.asPath.split('/')[1] !== 'catalog'
  }

  const plural = (n, str1, str2, str5) =>
    `${n} ${
      n % 10 == 1 && n % 100 != 11 ? str1 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? str2 : str5
    }`

  const moreTriggersRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenMoreTriggers(false)
    },
  })

  useEffect(() => {
    if (openMobMenu) {
      dispatch(setOpenMobMenu(false))
    }

    const requestURL = '/currencies'

    apiGET(requestURL, {}, (data) => {
      setCurrencyList(
        Object.keys(data)
          .map((c) => ({
            name: c,
            precision: 4,
            exChange: parseFloat(data[c]),
          }))
          .concat(RUB)
      )
    })

    const store = localStorage.getItem('catpart')
    if (store) {
      setCartData([...getJsonData(store)])
    }
  }, [])

  useEffect(() => {
    const user = localStorage.getItem('catpart-user')
    let userFields = {}

    if (user) {
      userFields = getJsonData(user)

      if (userFields.hasOwnProperty('currency')) {
        const userCurrency = currencyList?.find((c) => c.name === userFields.currency) || []
        if (userCurrency) {
          setCurrency(userCurrency)
        }
      }
    }
  }, [currencyList])

  const actualInfoChecker = (date) => {
    let actualInfo = ''

    if (dayjs(date).isValid()) {
      const now = new Date()
      const secDiff = Math.floor(now - date) / 1000

      setUpdateTime(secDiff > 300)

      if (secDiff <= 300) {
        actualTimer = setTimeout(() => {
          setUpdateTime(true)
        }, (300 - secDiff) * 1000)
      }

      actualInfo = ` Время обновления цен: ${date
        .toLocaleDateString('ru-Ru', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(',', '')} МСК`
    }

    setSearchInfo(
      // searchQueries.replace(/, $/, "") + ` найдено ${plural(totalData, "наименование", "наименования", "наименований")}.` +
      actualInfo
    )
  }

  const setCategorySortFunc = (field) => {
    if (categorySortField === field) {
      setCategorySortAsc(!categorySortAsc)
    } else {
      setCategorySortAsc(true)
      setCategorySortField(field)
    }
    setPageLimitTrigger(pageLimitTrigger + 1)
  }

  const removeFilter = (param, index) => {
    setCategoryFilter(
      categoryFilter.reduce((acc, f, fi) => {
        if (fi === param) {
          if (index < 0) {
            return acc
          } else if (f.values.length > 1) {
            f.values.splice(index, 1)
            return acc.concat(f)
          } else {
            return acc
          }
        } else {
          return acc.concat(f)
        }
      }, [])
    )
  }

  const updateCategoryList = (category, attributes, page) => {
    if (
      attributes &&
      attributes.hasOwnProperty('a') &&
      typeof attributes.a === 'object' &&
      !Array.isArray(attributes.a)
    ) {
      attributes.a = Object.keys(attributes.a).map((k) => attributes.a[k])
    }

    const requestURL = category

    let options = {
      page: catPage,
      limit: catPageLimit,
    }

    if (attributes && attributes.hasOwnProperty('a')) {
      options.attributes = attributes.a
        .filter((f) => !(f.id === 'm' || f.id === 'l'))
        .map((m) => {
          return {
            id: m.id,
            values: m.v,
          }
        })

      let manufacturer = attributes.a.find((f) => f.id === 'm')

      if (manufacturer) {
        options.manufacturer = manufacturer.v
      }
    }

    if (attributes && attributes.hasOwnProperty('m')) {
      options.manufacturer = attributes.m
    }

    if (categorySortField) {
      options.sort = {
        [categorySortField]: categorySortAsc ? 'asc' : 'desc',
      }
    }

    if (prevRequest !== requestURL + JSON.stringify(options)) {
      setPrevRequest(requestURL + JSON.stringify(options))

      // setCategoryPage(false);
      setItemData(null)
      setNodataText('')

      new Promise((resolve, reject) => {
        const data = getCategoryList(
          requestURL,
          attributes,
          catPage || 1,
          query?.l || 10,
          categorySortField || '',
          categorySortAsc ? 'asc' : 'desc'
        )

        if (data?.error) {
          reject()
        }

        resolve(data)
      }).then((catalogData) => {
        console.log('getCategoryList', catalogData)

        if (catalogData?.itemData) {
          setCategoryPage(false)
          setItemData(catalogData.itemData)

          if (catalogData?.searchData) {
            setSearchData(catalogData?.searchData || {})
          }
        } else {
          setItemData(null)
          setCategoryPage(true)

          setCategoryItems(catalogData?.categoryItems || [])
          setCatColumnsList(catalogData?.catColumnsList || [])
          //setNodataText(catalogData?.nodataText || '')

          setCategoryInfo(catalogData?.categoryInfo || null)
          setPagination(catalogData?.pagination || { pages: 1 })

          setNestedCategories(catalogData?.nestedCategories.slice(0) || [])

          if (typeof window !== 'undefined') {
            setTimeout(() => {
              let rtCellSizer = document.getElementById('rtCellSizer')

              if (rtCellSizer) {
                let goto = rtCellSizer.getBoundingClientRect().top + document.body.scrollTop + 30
                smoothScrollTo(document.body, document.body.scrollTop, goto, 600)
              }
            }, 200)
          }
        }

        //if (typeof window === 'undefined') {
        //  setShowCatPreloader(false)
        //}
      })

      //apiGET(requestURL, options, (data) => {
      //  if (data.error) {
      //    console.log('NO DATA', requestURL, data.error)
      //
      //    //setErrorPage(true)
      //  } else {
      //    //setErrorPage(false)
      //
      //
      //  }
      //
      //})
    } else {
      console.log('prevRequest skip', prevRequest)
      // setShowCatPreloader(false);
    }
  }

  useEffect(() => {
    console.log('searchData', searchData)
  }, [searchData])

  useEffect(() => {
    setPageLimitTrigger(pageLimitTrigger + 1)
  }, [catPage])

  useEffect(() => {
    return () => {
      clearTimeout(actualTimer)
    }
  }, [])

  const applyCategoryPage = () => {
    if (categoryPage) {
      let url = ''
      let options = {}
      let attrIds = []
      let page = 1

      //if (typeof window === 'undefined') {
      //  setShowCatPreloader(true)
      //}

      if (props.match.params.hasOwnProperty('catalogue') && props.match.params.catalogue !== 'catalog') {
        url = `/${props.match.params.catalogue.replace(/\//g, '')}`
      }

      if (props.match.params.hasOwnProperty('page')) {
        page = parseInt(props.match.params.page)
      }

      if (categoryFilter.length) {
        options.a = categoryFilter
          .filter((f) => f.id !== 'm')
          .map((m) => {
            return {
              id: m.id,
              v: m.values,
            }
          })

        let manufacturer = categoryFilter.find((f) => f.id === 'm')

        if (manufacturer) {
          options.m = manufacturer.values
        }
      }

      if (options && options.hasOwnProperty('a')) {
        attrIds = options.a.map((m) => parseInt(m.id))
      }

      updateFilterNames(options, attrIds)

      updateCategoryList(url, options, catPage)

      if (catPageLimit !== 10) {
        options.l = catPageLimit
      }

      if (categorySortField) {
        options.s = {
          [categorySortField]: categorySortAsc ? 'a' : 'd',
        }
      }

      //history.push(
      //  {
      //    pathname: (url || '/catalog') + '/' + (catPage > 1 ? `${catPage}/` : ''),
      //    search: qs.stringify(options),
      //    state: { isActive: true },
      //  },
      //  undefined,
      //  { shallow: true }
      //)
    }
  }

  useEffect(() => {
    counter++
    console.log('applyCategoryPage', counter)

    if (counter > 2) {
      applyCategoryPage()
    }
  }, [pageLimitTrigger, categoryFilterTrigger])

  if (typeof window === 'undefined') {
    counter++

    console.log('searchData, totalData', counter, searchData, totalData)

    if (counter > 2) {
      applyCategoryPage()
    }
  }

  useEffect(() => {
    console.log('history.asPath', history)
    setShowCatPreloader(true)
    setItemData(null)
    setCategoryPage(true)
    let url = ''
    let attrIds = []
    let options = history.query

    if (categoryPage) {
      url = '/' + history.asPath.replace(/\//g, '')
    } else {
      let queryAttr = options?.a
        ? options.a.map((m) => {
            return {
              id: m.id,
              values: m.v,
            }
          })
        : []

      if (options?.m) {
        queryAttr.push({
          id: 'm',
          name: 'Производитель',
          values: options.m,
        })
      }

      setCategoryFilter(queryAttr)
    }

    if (options?.a) {
      attrIds = options.a.map((m) => parseInt(m.id))
    }

    updateFilterNames(options, attrIds)

    updateCategoryList(url, options, catPage)
  }, [history.asPath])

  //useEffect(() => {
  //  let newURL = props.match.url.split('/')[1]
  //  if (prevPageURL !== newURL) {
  //    if (prevPageURL) {
  //      setCatPageLimit(10)
  //    }
  //    setPrevPageURL(newURL)
  //  }
  //}, [history.asPath])

  useEffect(
    (prev) => {
      if (categoryFilter.length) {
        setCatPage(1)
      }

      setCategoryFilterTrigger(categoryFilterTrigger + 1)
    },
    [categoryFilter]
  )

  const filterItemsHTML = useMemo(() => {
    return categoryFilterNames.length
      ? categoryFilterNames.map((f, fi) => (
          <React.Fragment key={fi}>
            <div className={'catalogue-page__filter-item __first'}>
              <span>{f.name}</span>
              <Ripples
                onClick={() => {
                  removeFilter(fi, -1)
                }}
                className={'btn__filter-remove btn __gray'}
                during={1000}
              >
                <span className="btn-inner">
                  <span className={'icon icon-close'} />
                </span>
              </Ripples>
            </div>

            {f.values.map((m, mi) => (
              <div key={mi} className={'catalogue-page__filter-item'}>
                <span>{m}</span>
                <Ripples
                  onClick={() => {
                    removeFilter(fi, mi)
                  }}
                  className={'btn__filter-remove btn __gray'}
                  during={1000}
                >
                  <span className="btn-inner">
                    <span className={'icon icon-close'} />
                  </span>
                </Ripples>
              </div>
            ))}
          </React.Fragment>
        ))
      : null
  }, [categoryFilterNames])

  const paginationHTML = useMemo(() => {
    let pages = getButtonsMap(pagination.pages, catPage)

    return pagination.pages && pagination.pages > 1
      ? pages.map((p, pi) => {
          return (
            <li key={pi} className={'catalogue-page__pagination-item'}>
              <Ripples
                onClick={
                  p.isMore
                    ? null
                    : () => {
                        setCatPage(parseInt(p.text))
                      }
                }
                className={'btn ' + (parseInt(p.text) === catPage ? '__blue' : '__gray')}
                during={1000}
              >
                <span className="btn-inner">{p.text}</span>
                {/*{p.isMore || parseInt(p.text) === catPage ?*/}
                {/*  <span className="btn-inner">{p.text}</span>*/}
                {/*  : <Link*/}
                {/*    to={(`/${props.match.url.split("/")[1]}/${parseInt(p.text) === 1 ? "" : p.text + "/"}` + history.location.search).replace(/\/\//, "/")}*/}
                {/*    className="btn-inner">{p.text}</Link>}*/}
              </Ripples>
            </li>
          )
        })
      : null
  }, [pagination, catPage])

  return (
    <React.Fragment>
      <div id="rtCellSizer" />

      {/* todo search and any category/product page */}

      <React.Fragment>
        <Breadcrumbs bread={breadcrumbs} />

        {categoryPage ? (
          <>
            <CataloguePage
              showCatPreloader={false}
              filterItemsHTML={filterItemsHTML}
              categoryItems={categoryItems}
              catColumnsList={catColumnsList}
              nestedCategories={nestedCategories?.slice(0) || []}
              categoryInfo={categoryInfo}
              categorySortField={categorySortField}
              setCategorySort={setCategorySortFunc}
              categoryFilterNames={categoryFilterNames}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />

            {noDataText ? <div className="catalogue-page__nodata">{noDataText}</div> : null}

            {categoryItems?.length ? (
              <div className="catalogue-page__pagination">
                {categoryItems.length > 10 || pagination.pages > 1 ? (
                  <ul className={'catalogue-page__pagination-list'}>
                    <li className={'catalogue-page__pagination-item'}>
                      <div ref={openPaginationRef} className="dropdown-holder">
                        <Ripples
                          onClick={() => {
                            setOpenPaginationDropdown(!openPaginationDropdown)
                          }}
                          className={'btn __gray' + (openPaginationDropdown ? ' __opened' : '')}
                          during={1000}
                        >
                          <span className="btn-inner">
                            <span>{catPageLimit}</span>
                            <span className={'icon icon-chevron-up'} />
                          </span>
                        </Ripples>
                        {openPaginationDropdown && (
                          <div className="dropdown-container">
                            <ul className="dropdown-list">
                              {pageLimitList.map((t, ti) => (
                                <li key={ti}>
                                  <Ripples
                                    onClick={() => {
                                      setOpenPaginationDropdown(false)
                                      setCategoryItems([])
                                      setPagination({ pages: 1 })
                                      setCatPageLimit(t)
                                      setCatPage(1)
                                      setPageLimitTrigger(pageLimitTrigger + 1)
                                    }}
                                    className="dropdown-link"
                                    during={1000}
                                  >
                                    {t}
                                  </Ripples>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  </ul>
                ) : null}

                {paginationHTML ? <ul className={'catalogue-page__pagination-list'}>{paginationHTML}</ul> : null}

                {pagination.pages > 3 ? (
                  <ul className={'catalogue-page__pagination-list'}>
                    <li className={'catalogue-page__pagination-item'}>
                      <Ripples
                        onClick={() => {
                          setCatPage(Math.max(1, catPage - 1))
                        }}
                        className={'btn __gray' + (catPage === 1 ? ' __disabled' : '')}
                        during={1000}
                      >
                        <span className="btn-inner">Пред.</span>
                        {/*{catPage === 1 ? <span className="btn-inner">Пред.</span> : <Link*/}
                        {/*  to={(`/${props.match.url.split("/")[1]}/${catPage > 2 ? (catPage - 1) + "/" : ""}` + history.location.search).replace(/\/\//, "/")}*/}
                        {/*  className="btn-inner">Пред.</Link>}*/}
                      </Ripples>
                    </li>
                    <li className={'catalogue-page__pagination-item'}>
                      <Ripples
                        onClick={() => {
                          setCatPage(catPage + (catPage < pagination.pages ? 1 : 0))
                        }}
                        className={'btn __gray' + (catPage === pagination.pages ? ' __disabled' : '')}
                        during={1000}
                      >
                        <span className="btn-inner">След.</span>
                        {/*{catPage === pagination.pages ? <span className="btn-inner">След.</span> : <Link*/}
                        {/*  to={(`/${props.match.url.split("/")[1]}/${(catPage + 1) + "/"}` + history.location.search).replace(/\/\//, "/")}*/}
                        {/*  className="btn-inner">След.</Link>}*/}
                      </Ripples>
                    </li>
                  </ul>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <CatalogueItem profile={profile} itemData={itemData} props={{ ...props }} />
        )}
      </React.Fragment>

      {fetchingDataInProgress || (!cart && formBusy && itemData === null) ? (
        <LoadingIndicator page={fetchingDataInProgress} />
      ) : null}

      {fetchingDataInProgress ? null : (
        <div className="form-filter__holder">
          <div className="form-filter">
            {!cart &&
              (scrollTriggers.length ? (
                <div className="form-filter__controls __wide">
                  {scrollTriggers.slice(0, TRIGGER_DROPDOWN_LIMIT).map((t, ti) => (
                    <div key={ti} className="form-filter__control">
                      {t}
                    </div>
                  ))}
                  {scrollTriggers.length > TRIGGER_DROPDOWN_LIMIT && (
                    <div ref={moreTriggersRef} className="form-filter__control">
                      <Ripples
                        onClick={() => {
                          setOpenMoreTriggers(!openMoreTriggers)
                        }}
                        className="btn __gray"
                        during={1000}
                      >
                        <span className="btn-inner">Перейти к</span>
                      </Ripples>
                      {openMoreTriggers && (
                        <div className="dropdown-container">
                          <ul className="dropdown-list">
                            {scrollTriggers.slice(TRIGGER_DROPDOWN_LIMIT).map((t, ti) => (
                              <li key={ti}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null)}

            {!cart && !formBusy && !categoryPage ? (
              <h1 className="form-filter__stat">{searchInfo}</h1>
            ) : (
              <div className="form-filter__stat">&nbsp;</div>
            )}

            {formBusy && itemData === null ? null : (
              <div className={`form-filter__controls${cart ? ' __cart' : ''}`}>
                {cart ? (
                  <div className="form-filter__controls_left">
                    <div className="form-filter__control">
                      <Ripples
                        onClick={() => {
                          const store = localStorage.getItem('catpart')
                          if (store) {
                            xlsDownload([...getJsonData(store)], currency, 0)
                          } else {
                            notificationFunc('success', 'Корзина пуста.', 'Нечего скачивать.')
                          }
                        }}
                        className="btn __gray"
                        during={1000}
                      >
                        <div className="btn-inner">
                          <span className="btn __blue">
                            <span className="btn-icon icon icon-download" />
                          </span>
                          <span>Скачать список</span>
                        </div>
                      </Ripples>
                    </div>
                  </div>
                ) : someCategoryUrl ? (
                  <>
                    {itemData !== null ? (
                      <div className="form-filter__controls_left">
                        <div className="form-filter__control">
                          <Ripples
                            onClick={() => {
                              // onSubmitSearchForm(itemData.title, 1);
                              sendSearchRequest({
                                q: itemData.title,
                                c: 1,
                              })

                              actualInfoChecker(new Date())
                            }}
                            className={'btn ' + (updateTime ? '__blue' : '__gray')}
                            during={1000}
                          >
                            <span
                              // to={`/search/?art=${encodeURIComponent("max44")}&q=${encodeURIComponent(1)}`}
                              className="btn-inner"
                            >
                              <span>Получить актуальные цены</span>
                            </span>
                          </Ripples>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            )}
          </div>

          {
            <>
              {formBusy || categoryPage ? null : totalData > 0 && !categoryPage ? (
                <>
                  <SearchResults
                    updateTime={updateTime}
                    scrollTriggers={scrollTriggers}
                    setScrollTriggers={setScrollTriggers}
                    setTableHeadFixed={setTableHeadFixed}
                    //setShowTableHeadFixed={setShowTableHeadFixed}
                    updateCart={updateCart}
                    notificationFunc={notificationFunc}
                    highlight={decodeURIComponent(query?.art || '')}
                    showResults={!formBusy}
                    count={query?.q || ''}
                    currencyList={currencyList}
                    currency={currency}
                    bom={searchData.bom}
                    list={searchData.res}
                    relativeTime={itemData !== null}
                  />
                </>
              ) : someCategoryUrl ? null : elaboration?.length > 0 ? (
                <>
                  <DeepElaboration data={elaboration} setElaboration={setElaboration} />
                  <OrderForm
                    profile={profile}
                    setOpenAuthPopup={setOpenAuthPopup}
                    updateCart={updateCart}
                    notificationFunc={notificationFunc}
                    totalCart={totalCart}
                    currency={currency}
                    elaboration={elaboration}
                  />
                </>
              ) : null}

              {!categoryPage && itemData !== null ? (
                <>
                  {totalData > 0 ? null : (
                    <SupplyNotification notificationFunc={notificationFunc} itemData={itemData} />
                  )}
                  <SimilarSlider searchData={searchData} itemData={itemData} />
                </>
              ) : null}
            </>
          }
        </div>
      )}
    </React.Fragment>
  )
}

SomeCatalogPage.propTypes = {
  searchData: PropTypes.object,
  someCategoryUrl: PropTypes.bool,
  cart: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  notificationFunc: PropTypes.func,
  sendSearchRequest: PropTypes.func,
  // currency: PropTypes.string,
  onChangeCurrency: PropTypes.func,
}

export default SomeCatalogPage
