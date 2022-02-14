/*
 * FilterForm
 *
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAtom } from 'jotai'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import qs from 'qs'
import React, { useEffect, memo, useState, useMemo } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import Ripples from 'react-ripples'

// import reducer from './reducer';
// import saga from './saga';
//import { findPriceIndex } from '../../utils/findPriceIndex'

import priceFormatter from '../../utils/priceFormatter'
import Breadcrumbs from '../Breadcrumbs'
import { CartResults } from '../CartResults'
import CatalogueItem from '../CatalogueItem'
import CataloguePage from '../CataloguePage'
import DeepElaboration from '../DeepElaboration'
import NotFoundPage from '../NotFoundPage/Loadable'
import { OrderForm } from '../OrderForm'
import { SearchResults } from '../SearchResults'
import Share from '../Share'
import SimilarSlider from '../SimilarSlider'
import SkeletonDt from '../SkeletonDt'
import SkeletonTab from '../SkeletonTab'
import SkeletonWide from '../SkeletonWide'
import SupplyNotification from '../SupplyNotification'

import { RUB, TRIGGER_DROPDOWN_LIMIT } from '@/store/constants'
import {
  busyOrderJotai,
  categoryItemsJotai,
  currencyJotai,
  currencyListJotai,
  errorPageJotai,
  formBusyJotai,
  isDevModeJotai,
  nestedCategoriesJotai,
  openAuthPopupJotai,
  openCatalogueJotai,
  openMobMenuJotai,
  orderSentJotai,
  profileJotai,
  searchDataJotai,
  showTableHeadFixedJotai,
  tableHeadFixedJotai,
  totalCartJotai,
} from '@/store/store'
import { getJsonData } from '@/utils/getJsonData'
import { getButtonsMap } from '@/utils/getPaginationMap'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import { xlsDownload } from '@/utils/xlsDownload'

dayjs.extend(relativeTime)

// const key = 'home';

export function FilterForm({
  apiGETBridge,
  createNotification,
  updateCart,
  sendSearchRequest,
  loading,
  error,
  onChangeCurrency,
  onSubmitSearchForm,
}) {
  const history = useRouter()
  const query = history.query

  const cart = history.pathname === '/order'
  const someCategoryUrl = !(history.pathname === '/search' || history.pathname === '/order')

  const [profile, setProfile] = useAtom(profileJotai)
  const [errorPage, setErrorPage] = useAtom(errorPageJotai)
  const [categoryItems, setCategoryItems] = useAtom(categoryItemsJotai)

  const [totalCart, setTotalCart] = useAtom(totalCartJotai)
  const [searchData, setSearchData] = useAtom(searchDataJotai)
  const [tableHeadFixed, setTableHeadFixed] = useAtom(tableHeadFixedJotai)

  const [nestedCategories, setNestedCategories] = useAtom(nestedCategoriesJotai)
  const [currency, setCurrency] = useAtom(currencyJotai)
  const [currencyList, setCurrencyList] = useAtom(currencyListJotai)
  const [orderSent, setOrderSent] = useAtom(orderSentJotai)
  const [openMobMenu, setOpenMobMenu] = useAtom(openMobMenuJotai)
  const [showTableHeadFixed, setShowTableHeadFixed] = useAtom(showTableHeadFixedJotai)
  const [openAuthPopup, setOpenAuthPopup] = useAtom(openAuthPopupJotai)
  const [busyOrder, setBusyOrder] = useAtom(busyOrderJotai)
  const [formBusy, setFormBusy] = useAtom(formBusyJotai)
  const [devMode, setDevMode] = useAtom(isDevModeJotai)
  const [openCatalogue, setOpenCatalogue] = useAtom(openCatalogueJotai)

  let actualTimer

  const params = history.query

  const pageLimitList = [
    // 1, 2, 3,
    10, 25, 50,
  ]

  const [categoryInfo, setCategoryInfo] = useState(null)

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

        apiGETBridge(requestURL, { ids: ids }, (data) => {
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
      setCategoryFilterNames(filterNames)
    }
  }

  const [openPaginationDropdown, setOpenPaginationDropdown] = useState(false)

  const openPaginationRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenPaginationDropdown(false)
    },
  })
  // const [responseData, setResponseData] = useState(null);
  const [prevPageURL, setPrevPageURL] = useState('')
  const [prevRequestAttr, setPrevRequestAttr] = useState('')
  const [prevRequest, setPrevRequest] = useState('')
  const [count, setCount] = useState(0)
  const [searchInfo, setSearchInfo] = useState('')
  const [updateTime, setUpdateTime] = useState(false)
  const [categoryPage, setCategoryPage] = useState(false)

  const [totalData, setTotalData] = useState(-1)
  const [cartData, setCartData] = useState([])
  const [scrollTriggers, setScrollTriggers] = useState([])
  const [elaboration, setElaboration] = useState([])
  const [openShare, setOpenShare] = useState(false)
  const [openMoreTriggers, setOpenMoreTriggers] = useState(false)
  const [catColumnsList, setCatColumnsList] = useState([])

  const paramsLimit = params.hasOwnProperty('l') ? parseInt(params.l) : 10

  const [catPageLimit, setCatPageLimit] = useState(
    !isNaN(paramsLimit) && pageLimitList.indexOf(paramsLimit) > -1 ? paramsLimit : 10
  )
  const [pageLimitTrigger, setPageLimitTrigger] = useState(0)
  const paramsPage = parseInt(history.pathname.split('/')[2])
  const [catPage, setCatPage] = useState(isNaN(paramsPage) ? 1 : paramsPage)
  const [categoryFilterTrigger, setCategoryFilterTrigger] = useState(0)

  const [noDataText, setNodataText] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [pagination, setPagination] = useState({ pages: 1 })
  const [itemData, setItemData] = useState(null)
  const [showCatPreloader, setShowCatPreloader] = useState(false)

  // todo get props from history
  const props = {
    match: {
      url: history.pathname,
      params: {
        catalogue: 'catalog',
        page: '2',
      },
    },
  }

  console.log('paramsPage', paramsPage, history.pathname.split('/'))

  const isCatalogueRoot = () => {
    // todo match catalogue
    // props.match.params.hasOwnProperty('catalogue') &&
    return history.pathname.split('/')[1] !== 'catalog'
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
    setOpenMobMenu(false)

    const requestURL = '/currencies'

    apiGETBridge(requestURL, {}, (data) => {
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
        const userCurrency = currencyList.find((c) => c.name === userFields.currency)
        if (userCurrency) {
          setCurrency(userCurrency)
        }
      }
    }
  }, [currencyList])

  const scrollTriggerHandler = (goto) => {
    setOpenMoreTriggers(false)

    const target = document.querySelector(`.search-results__table .trigger-${goto}`)

    if (target) {
      smoothScrollTo(document.body, document.body.scrollTop, target.getBoundingClientRect().top - 50, 600)
    }
  }

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

  useEffect(() => {
    devMode && console.log('searchData', cart, !cart && searchData && searchData.hasOwnProperty('res'), searchData)

    if (!cart && searchData && searchData.hasOwnProperty('res')) {
      devMode &&
        console.log(
          'setTotalData',
          searchData.res.reduce((total, c) => total + (c.hasOwnProperty('data') ? c.data.length : 0), 0)
        )
      setTotalData(searchData.res.reduce((total, c) => total + (c.hasOwnProperty('data') ? c.data.length : 0), 0))
    }

    if (searchData && searchData.hasOwnProperty('res') && searchData.res.length) {
      let searchQueries =
        (searchData.res.length > 1 ? 'По запросам' : 'По запросу') +
        searchData.res.reduce((total, c) => total + (c.hasOwnProperty('q') ? `«${c.q}», ` : ''), ' ')

      devMode && console.log('searchQueries', searchQueries, searchData)

      if (
        searchData.res.length &&
        searchData.res[0].hasOwnProperty('data') &&
        searchData.res[0].data.length &&
        searchData.res[0].data[0].hasOwnProperty('updated_at')
      ) {
        actualInfoChecker(new Date(searchData.res[0].data[0].updated_at))
      }
    }

    devMode && console.log('totalData', totalData, searchData)

    if (totalData === 0 && searchData && searchData.hasOwnProperty('res')) {
      let deep = searchData.res.map((item) => {
        return {
          name: item.q,
          quantity: item.c,
        }
      })

      setElaboration(deep)
    }

    if (searchData && searchData.bom && totalData) {
      setScrollTriggers(
        searchData.res.map((c, ci) =>
          ci >= TRIGGER_DROPDOWN_LIMIT ? (
            <Ripples
              key={ci}
              onClick={() => {
                scrollTriggerHandler(ci)
              }}
              className="dropdown-link"
              during={1000}
            >
              {c.q}
            </Ripples>
          ) : (
            <Ripples
              key={ci}
              onClick={() => {
                scrollTriggerHandler(ci)
              }}
              className="btn __gray"
              during={1000}
            >
              <span className="btn-inner">{c.q}</span>
            </Ripples>
          )
        )
      )
    } else {
      setScrollTriggers([])
    }
  }, [searchData, totalData])

  const onChangeSwitch = (evt) => {
    const user = localStorage.getItem('catpart-user')
    let userFields = { currency: evt.target.dataset.currency }

    if (user) {
      userFields = getJsonData(user)
      userFields.currency = evt.target.dataset.currency
    }

    localStorage.setItem('catpart-user', JSON.stringify(userFields))

    // console.log('onChangeSwitch', currency, evt.target);
    // onChangeCurrency(evt.target.value, evt.target.dataset.currency);
    setCurrency({
      exChange: parseFloat(evt.target.value),
      name: evt.target.dataset.currency,
      precision: evt.target.dataset.currency === 'RUB' ? 2 : 4,
    })
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

  const getCategoryList = (category, attributes, page) => {
    if (
      attributes &&
      attributes.hasOwnProperty('a') &&
      typeof attributes.a === 'object' &&
      !Array.isArray(attributes.a)
    ) {
      attributes.a = Object.keys(attributes.a).map((k) => attributes.a[k])
    }

    const requestURL = '/catalog' + category

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

      apiGETBridge(requestURL, options, (data) => {
        if (data.error) {
          console.log('NO DATA', requestURL, data.error)

          setErrorPage(true)
        } else {
          setErrorPage(false)

          let catColumnNames = []

          if (data.hasOwnProperty('product')) {
            setCategoryPage(false)
            setItemData(data.product)

            if (data.hasOwnProperty('histories') && data.histories.res) {
              setSearchData(data.histories)
            }
          } else if (data.hasOwnProperty('items')) {
            setCategoryPage(true)
            setItemData(null)
            let items = []
            if (data.items.length) {
              data.items.forEach((d, di) => {
                let params = {}

                if (d.snippet.specs && d.snippet.specs.length) {
                  d.snippet.specs.forEach((s, si) => {
                    catColumnNames.push({
                      attributeId: s.attribute.id || 'no_id_' + di,
                      accessor: s.attribute.name,
                    })
                    params[s.attribute.name] = s.display_value
                  })
                }

                items.push({
                  catImage: d.image || '',
                  catPartLink: d.slug || '',
                  catPartNum: d.title || '!title!',
                  catManufacturer: d.snippet.manufacturer.name || '!manufacturer!',
                  ...params,
                })
              })
            } else {
              setCategoryItems([])
              setNodataText(`Нет данных ${props.match.url} страница ${catPage} лимит ${catPageLimit}`)
            }

            setCatColumnsList(
              catColumnNames.reduce((acc, c) => {
                if (acc.findIndex((a) => a.attributeId === c.attributeId) === -1) {
                  return acc.concat(c)
                } else {
                  return acc
                }
              }, [])
            )
            setCategoryItems(items)
          } else {
            setNodataText(`Что-то пошло не так и не туда ${props.match.url} страница ${catPage} лимит ${catPageLimit}`)
          }

          if (data.hasOwnProperty('category')) {
            setCategoryInfo(data.category)
          }

          if (data.hasOwnProperty('breadcrumbs')) {
            setBreadcrumbs(data.breadcrumbs)
          }

          if (data.hasOwnProperty('breadcrumbs')) {
            setBreadcrumbs(data.breadcrumbs)
          }

          if (data.hasOwnProperty('pagination') && data.pagination.pages) {
            setPagination(data.pagination)
          }

          if (data.hasOwnProperty('nestedCategories') && data.nestedCategories.length) {
            setNestedCategories(data.nestedCategories.slice(0))
          } else {
            setNestedCategories([])
          }

          setTimeout(() => {
            let rtCellSizer = document.getElementById('rtCellSizer')

            if (rtCellSizer) {
              let goto = rtCellSizer.getBoundingClientRect().top + document.body.scrollTop + 30
              smoothScrollTo(document.body, document.body.scrollTop, goto, 600)
            }
          }, 200)
        }

        setShowCatPreloader(false)
      })
    } else {
      console.log('prevRequest skip', prevRequest)
      // setShowCatPreloader(false);
    }
  }

  useEffect(() => {
    setPageLimitTrigger(pageLimitTrigger + 1)
  }, [catPage])

  useEffect(() => {
    return () => {
      clearTimeout(actualTimer)
    }
  }, [])

  useEffect(() => {
    if (categoryPage && someCategoryUrl) {
      let url = ''
      let options = {}
      let attrIds = []
      let page = 1

      setShowCatPreloader(true)

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

      getCategoryList(url, options, catPage)

      if (catPageLimit !== 10) {
        options.l = catPageLimit
      }

      if (categorySortField) {
        options.s = {
          [categorySortField]: categorySortAsc ? 'a' : 'd',
        }
      }

      history.push({
        pathname: (url || '/catalog') + '/' + (catPage > 1 ? `${catPage}/` : ''),
        search: qs.stringify(options),
        state: { isActive: true },
      })
    }
  }, [pageLimitTrigger, categoryFilterTrigger])

  useEffect(() => {
    if (someCategoryUrl) {
      setShowCatPreloader(true)
      setItemData(null)
      setCategoryPage(true)
      let url = ''
      let attrIds = []
      let options = qs.parse(props.location.search.substring(1))

      if (props.match.params.hasOwnProperty('catalogue') && props.match.params.catalogue !== 'catalog') {
        url = '/' + props.match.params.catalogue.replace(/\//g, '')
      } else {
        let queryAttr =
          options && options.hasOwnProperty('a')
            ? options.a.map((m) => {
                return {
                  id: m.id,
                  values: m.v,
                }
              })
            : []

        if (options && options.hasOwnProperty('m')) {
          queryAttr.push({
            id: 'm',
            name: 'Производитель',
            values: options.m,
          })
        }

        setCategoryFilter(queryAttr)
      }

      if (options && options.hasOwnProperty('a')) {
        attrIds = options.a.map((m) => parseInt(m.id))
      }

      updateFilterNames(options, attrIds)

      getCategoryList(url, options, catPage)
    } else {
      setShowCatPreloader(false)
      setItemData(null)
      setErrorPage(false)
      setCategoryPage(false)
    }
  }, [prevPageURL])

  useEffect(() => {
    let newURL = props.match.url.split('/')[1]
    if (prevPageURL !== newURL) {
      if (prevPageURL) {
        setCatPageLimit(10)
      }
      setPrevPageURL(newURL)
    }
  }, [props.match.url])

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

  return errorPage ? (
    <NotFoundPage setOpenMobMenu={setOpenMobMenu} {...props} />
  ) : (
    <>
      <div id="rtCellSizer" />
      {cart ? (
        <Head>
          <title>Оформление заказа - CATPART.RU</title>
          <meta name="description" content="Оформление заказа - CATPART.RU" />
          <meta name="keywords" content="Оформление заказа - CATPART.RU" />
          <link rel="canonical" href="https://catpart.ru/order/" />
        </Head>
      ) : props.match.path === '/search' ? (
        <Head>
          <title>{searchInfo}</title>
          <meta name="description" content={searchInfo} />
          <meta name="keywords" content={searchInfo} />
          <link rel="canonical" href="https://catpart.ru/" />
        </Head>
      ) : null}

      {/* todo search and any category/product page */}
      {!cart && someCategoryUrl ? (
        <>
          {props.match.params.hasOwnProperty('catalogue') && props.match.params.catalogue !== 'catalog' ? (
            <Breadcrumbs bread={breadcrumbs} />
          ) : null}

          {itemData ? (
            <CatalogueItem profile={profile} itemData={itemData} props={{ ...props }} />
          ) : categoryPage ? (
            <>
              <CataloguePage
                showCatPreloader={showCatPreloader}
                filterItemsHTML={filterItemsHTML}
                categoryItems={categoryItems}
                catColumnsList={catColumnsList}
                nestedCategories={nestedCategories.slice(0)}
                categoryInfo={categoryInfo}
                categorySortField={categorySortField}
                setCategorySort={setCategorySortFunc}
                categoryFilterNames={categoryFilterNames}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
              />

              {noDataText ? <div className="catalogue-page__nodata">{noDataText}</div> : null}

              {categoryItems.length ? (
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
          ) : null}
        </>
      ) : null}

      {!cart && formBusy && itemData === null ? (
        <div className="skeleton-holder">
          <div className="skeleton skeleton-mob">
            <SkeletonWide />
          </div>
          <div className="skeleton skeleton-tab">
            <SkeletonTab />
          </div>
          <div className="skeleton skeleton-dt">
            <SkeletonDt />
          </div>
          <div className="skeleton skeleton-wide">
            <SkeletonWide />
          </div>
        </div>
      ) : null}

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
                          createNotification('success', 'Корзина пуста.', 'Нечего скачивать.')
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
                          className={'btn __blue' + (formBusy ? ' __loader' : '')}
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
              ) : totalData > 0 ? (
                <div className="form-filter__controls_left">
                  <div className="form-filter__control">
                    <Ripples
                      onClick={() => {
                        xlsDownload(searchData.res, currency, searchData.bom ? 1 : -1)
                      }}
                      className="btn __gray"
                      during={1000}
                    >
                      <span className="btn-inner">
                        <span className="btn __blue">
                          <span className="btn-icon icon icon-download" />
                        </span>
                        <span>Скачать результат поиска</span>
                      </span>
                    </Ripples>
                  </div>
                  <div className="form-filter__control">
                    <Ripples
                      onClick={() => {
                        setOpenShare(true)
                      }}
                      className="btn __gray"
                      during={1000}
                    >
                      <span className="btn-inner">Поделиться</span>
                    </Ripples>
                    {openShare && (
                      <Share
                        shareUrl={encodeURIComponent(window.location.href)}
                        shareText={encodeURIComponent(searchInfo)}
                        notificationFunc={createNotification}
                        setOpenFunc={setOpenShare}
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {cart || (totalData > 0 && !categoryPage) ? (
                <div onChange={onChangeSwitch} className="form-filter__controls_right">
                  {currencyList &&
                    currencyList.length > 1 &&
                    currencyList.map((cur, ind) => (
                      <Ripples key={ind} className="form-filter__control" during={1000}>
                        <label className="form-radio__btn">
                          <input
                            name="currency"
                            className="hide"
                            // checked={}
                            defaultChecked={currency.name === cur.name ? true : null}
                            data-currency={cur.name}
                            type="radio"
                            value={cur.exChange}
                          />
                          <span className="btn __gray">
                            <b>{cur.name}</b>
                            {cur.name !== 'RUB' && <span>{priceFormatter(cur.exChange, cur.precision)}</span>}
                          </span>
                        </label>
                      </Ripples>
                    ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {cart ? (
          <>
            <CartResults
              setTableHeadFixed={setTableHeadFixed}
              setShowTableHeadFixed={setShowTableHeadFixed}
              updateCart={updateCart}
              list={cartData}
              notificationFunc={createNotification}
              showResults={!formBusy}
              count={count}
              currency={currency}
            />

            <OrderForm
              profile={profile}
              history={history}
              setOpenAuthPopup={setOpenAuthPopup}
              updateCart={updateCart}
              notificationFunc={createNotification}
              totalCart={totalCart}
              currency={currency}
              delivery
            />
          </>
        ) : (
          <>
            {formBusy || categoryPage ? null : totalData > 0 && !categoryPage ? (
              <>
                <SearchResults
                  updateTime={updateTime}
                  scrollTriggers={scrollTriggers}
                  setScrollTriggers={setScrollTriggers}
                  setTableHeadFixed={setTableHeadFixed}
                  setShowTableHeadFixed={setShowTableHeadFixed}
                  updateCart={updateCart}
                  notificationFunc={createNotification}
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
            ) : someCategoryUrl ? null : elaboration.length > 0 ? (
              <>
                <DeepElaboration data={elaboration} setElaboration={setElaboration} elaboration={elaboration} />
                <OrderForm
                  profile={profile}
                  history={history}
                  setOpenAuthPopup={setOpenAuthPopup}
                  setBusyOrder={setBusyOrder}
                  updateCart={updateCart}
                  notificationFunc={createNotification}
                  totalCart={totalCart}
                  currency={currency}
                  setElaboration={setElaboration}
                  elaboration={elaboration}
                />
              </>
            ) : null}

            {!categoryPage && itemData !== null ? (
              <>
                {totalData > 0 ? null : (
                  <SupplyNotification notificationFunc={createNotification} itemData={itemData} />
                )}
                <SimilarSlider searchData={searchData} itemData={itemData} />
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}

FilterForm.propTypes = {
  searchData: PropTypes.object,
  someCategoryUrl: PropTypes.bool,
  cart: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  createNotification: PropTypes.func,
  sendSearchRequest: PropTypes.func,
  // currency: PropTypes.string,
  onChangeCurrency: PropTypes.func,
}

export default FilterForm
