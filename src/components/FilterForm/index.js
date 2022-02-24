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
import priceFormatter from '../../utils/priceFormatter'
import { CartResults } from '../CartResults'
import DeepElaboration from '../DeepElaboration'
import { OrderForm } from '../OrderForm'
import { SearchResults } from '../SearchResults'
import Share from '../Share'

import LoadingIndicator from '@/components/LoadingIndicator'
import { RUB, TRIGGER_DROPDOWN_LIMIT } from '@/store/constants'
import { getJsonData } from '@/utils/getJsonData'
import apiGET from '@/utils/search'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import { xlsDownload } from '@/utils/xlsDownload'

dayjs.extend(relativeTime)
let counter = 0

export function FilterForm({
  notificationFunc,
  updateCart,
  sendSearchRequest,
  profile,
  errorPage,
  categoryItems,
  setCategoryItems,
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

  const query = history.query

  const { formBusy, fetchingDataInProgress } = useSelector((state) => state.search)

  const cart = history.asPath === '/order'

  const { openMobMenu } = useSelector((state) => state.menus)

  const [count, setCount] = useState(0)
  const [searchInfo, setSearchInfo] = useState('')
  const [updateTime, setUpdateTime] = useState(false)

  const [totalData, setTotalData] = useState(-1)
  const [scrollTriggers, setScrollTriggers] = useState([])
  const [elaboration, setElaboration] = useState([])
  const [openShare, setOpenShare] = useState(false)
  const [openMoreTriggers, setOpenMoreTriggers] = useState(false)

  const [pageLimitTrigger, setPageLimitTrigger] = useState(0)
  const paramsPage = parseInt(history.asPath.split('/')[2])
  const [catPage, setCatPage] = useState(isNaN(paramsPage) ? 1 : paramsPage)

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

  //console.log('FilterForm', params, paramsPage, history.asPath.split('/'))

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

  const scrollTriggerHandler = (goto) => {
    setOpenMoreTriggers(false)

    const target = document.querySelector(`.search-results__table .trigger-${goto}`)

    if (target) {
      smoothScrollTo(document.body, document.body.scrollTop, target.getBoundingClientRect().top - 50, 600)
    }
  }

  const applySearch = () => {
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
  }

  useEffect(() => {
    applySearch()
  }, [searchData, totalData])

  if (typeof window === 'undefined') {
    if (!counter) {
      applySearch()
    }
    counter++
  }

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

  useEffect(() => {
    setPageLimitTrigger(pageLimitTrigger + 1)
  }, [catPage])

  return (
    <React.Fragment>
      {cart ? (
        <Head>
          <title>Оформление заказа - CATPART.RU</title>
          <meta name="description" content="Оформление заказа - CATPART.RU" />
          <meta name="keywords" content="Оформление заказа - CATPART.RU" />
          <link rel="canonical" href="https://catpart.ru/order/" />
        </Head>
      ) : history.asPath === '/search' ? (
        <Head>
          <title>{searchInfo}</title>
          <meta name="description" content={searchInfo} />
          <meta name="keywords" content={searchInfo} />
          <link rel="canonical" href="https://catpart.ru/" />
        </Head>
      ) : null}

      {fetchingDataInProgress || (!cart && formBusy) ? <LoadingIndicator page={fetchingDataInProgress} /> : null}

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

            {!cart && !formBusy ? (
              <h1 className="form-filter__stat">{searchInfo}</h1>
            ) : (
              <div className="form-filter__stat">&nbsp;</div>
            )}

            {formBusy ? null : (
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
                          notificationFunc={notificationFunc}
                          setOpenFunc={setOpenShare}
                        />
                      )}
                    </div>
                  </div>
                ) : null}

                {cart || totalData > 0 ? (
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
            <React.Fragment>
              <CartResults
                setTableHeadFixed={setTableHeadFixed}
                //setShowTableHeadFixed={setShowTableHeadFixed}
                updateCart={updateCart}
                list={cartData}
                notificationFunc={notificationFunc}
                showResults={!formBusy}
                count={count}
                currency={currency}
              />

              <OrderForm
                profile={profile}
                setOpenAuthPopup={setOpenAuthPopup}
                updateCart={updateCart}
                notificationFunc={notificationFunc}
                totalCart={totalCart}
                currency={currency}
                devMode={devMode}
                delivery
              />
            </React.Fragment>
          ) : (
            <>
              {formBusy ? null : totalData > 0 ? (
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
                  />
                </>
              ) : elaboration?.length > 0 ? (
                <>
                  <DeepElaboration data={elaboration} setElaboration={setElaboration} />
                  <OrderForm
                    profile={profile}
                    setOpenAuthPopup={setOpenAuthPopup}
                    updateCart={updateCart}
                    notificationFunc={notificationFunc}
                    totalCart={totalCart}
                    currency={currency}
                    devMode={devMode}
                    elaboration={elaboration}
                  />
                </>
              ) : null}
            </>
          )}
        </div>
      )}
    </React.Fragment>
  )
}

FilterForm.propTypes = {
  searchData: PropTypes.object,
  cart: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  notificationFunc: PropTypes.func,
  sendSearchRequest: PropTypes.func,
  // currency: PropTypes.string,
  onChangeCurrency: PropTypes.func,
}

export default FilterForm
