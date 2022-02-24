import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import React, { useEffect, useState } from 'react'
import { ReactNotifications, Store } from 'react-notifications-component'
import { useDispatch, useSelector } from 'react-redux'
import { SWRConfig } from 'swr'

import { setOrderSent } from '../../../store/cart/action'
import { setCloseAllMenus, setOpenDetails, setOpenProfile, setOpenRequisites } from '../../../store/menus/action'
import { setFetchingDataInProgress } from '../../../store/search/action'
import { setFormBusy } from '../../../store/search/action'

import AsideContainer from '@/components/AsideContainer'
import Layout from '@/components/Layout/layout'
import OrderDetails from '@/components/OrderDetails'
import Profile from '@/components/Profile'
import ProfileRequisites from '@/components/ProfileRequisites'
import { LOUISYEN_PRICE_LIMIT } from '@/store/constants'
import {
  asideContentJotai,
  cartCountJotai,
  isAbove1500Jotai,
  isDevModeJotai,
  profileCheckedJotai,
  profileJotai,
  searchCountJotai,
  totalCartJotai,
  appDragJotai,
  currencyJotai,
} from '@/store/store'
import { findPriceIndex } from '@/utils/findPriceIndex'
import { getJsonData } from '@/utils/getJsonData'
import apiGET from '@/utils/search'
import apiPOST from '@/utils/upload'

Number.prototype.toFixedCustom = function (decimals) {
  const base = Math.pow(10, decimals)
  // console.log('toFixedCustom', this, decimals, Math.round((this + Number.EPSILON) * base) / base);
  return Math.round((this + Number.EPSILON) * base) / base
}

function NextCatpartApp({ Component, pageData, errorData, fetchingPage, catalogData, catalogMenu, ...pageProps }) {
  const history = useRouter()
  const dispatch = useDispatch()

  const { busyOrder } = useSelector((state) => state.cart)
  const { formBusy } = useSelector((state) => state.search)
  const { asideOpen, openProfile, openRequisites, openDetails } = useSelector((state) => state.menus)

  const [currencyList, setCurrencyList] = useState(pageProps?.currencyList || [])
  const [searchData, setSearchData] = useState(pageProps?.searchData || {})
  const [appDrag, setAppDrag] = useState(appDragJotai)
  const [asideContent, setAsideContent] = useState(asideContentJotai)
  const [cartData, setCartData] = useState([])
  const [profileChecked, setProfileChecked] = useState(profileCheckedJotai)
  const [profile, setProfile] = useState(profileJotai)
  const [devMode, setDevMode] = useState(isDevModeJotai)
  const [cartCount, setCartCount] = useState(cartCountJotai)
  const [isAbove1500, setIsAbove1500] = useState(isAbove1500Jotai)
  const [currency, setCurrency] = useState(currencyJotai)
  const [totalCart, setTotalCart] = useState(totalCartJotai)
  const [searchCount, setSearchCount] = useState(searchCountJotai)

  const getUSDExchange = () => {
    const USD = currencyList.find((f) => f.name === 'USD')
    return USD && USD.hasOwnProperty('exChange') ? USD.exChange : 1
  }

  const createNotification = (type, title, text) => {
    devMode && console.log('createNotification', type, text)

    switch (type) {
      case 'info':
        break
      case 'success':
        Store.addNotification({
          title,
          message: text,
          type: 'default',
          insert: 'top',
          container: 'top-right',
          animationIn: ['animate__animated', 'animate__bounceInRight'],
          animationOut: ['animate__animated', 'animate__bounceOutRight'],
          dismiss: {
            duration: 2000,
            waitForAnimation: true,
            pauseOnHover: true,
            onScreen: false,
          },
        })
        break
      case 'warning':
        break
      case 'error':
        break
    }
  }

  const logOut = () => {
    devMode && console.log('logOut')
    localStorage.removeItem('access_token')
    localStorage.removeItem('catpart-profile')
    history.push('/', undefined, { shallow: true })
    setProfile({})
    setProfileChecked(true)
  }

  const needLogin = () => {
    devMode && console.log('needLogin', profile)
    logOut()
    createNotification('success', `Требуется авторизация`, ' ')
  }

  const updateStore = (store, options, cb) => {
    const requestURL = '/search/check_price'

    apiGET(requestURL, options, (data) => {
      data.forEach((item) => {
        store.forEach((storeItem, storeIndex) => {
          if (storeItem.id === item.id) {
            store[storeIndex] = { ...storeItem, ...item }
          }
        })
      })
      cb(store)
    })
  }

  const updateAll = (store, options, cb) => {
    const requestURL = '/cart/calculate'

    apiPOST(
      requestURL,
      options,
      {},
      (data) => {
        data.forEach((item) => {
          store.forEach((storeItem, storeIndex) => {
            if (storeItem.id === item.id) {
              store[storeIndex] = { ...storeItem, ...item }
            }
          })
        })
        cb(store)
      },
      true
    )
  }

  const checkSupplierPrices = (store, supplier, done) => {
    const filteredItems = store.filter((f) => (supplier ? f.supplier === supplier : true))

    devMode && console.log('filteredItems', filteredItems)

    if (filteredItems.length) {
      const totalPrice =
        filteredItems.reduce((total, l) => l.pricebreaks[findPriceIndex(l.pricebreaks, l.cart)].price * l.cart, 0) /
        getUSDExchange()

      if (!supplier) {
        const options = filteredItems.map((m) => ({
          id: m.id,
          pricebreaks: m.pricebreaks,
        }))

        updateAll(store, options, (data) => {
          checkSupplierPrices(data, 'Louisyen', done)
        })
      } else {
        const options = {
          basketPrice: totalPrice,
          ids: filteredItems.map((m) => m.id),
        }

        if (totalPrice > LOUISYEN_PRICE_LIMIT) {
          if (!isAbove1500) {
            updateStore(store, options, (data) => {
              setIsAbove1500(true)
              done(data)
            })
          } else {
            done(store)
          }
        } else {
          if (isAbove1500) {
            updateStore(store, options, (data) => {
              setIsAbove1500(false)
              done(data)
            })
          } else {
            done(store)
          }
        }
      }
    } else {
      done(store)
    }
  }

  const sendSearchRequest = (options) => {
    const requestURL = '/search'

    setSearchCount(+(options?.c || 1))

    if (typeof ym === 'function') {
      ym(81774553, 'reachGoal', 'usedsearch')
    }

    apiGET(requestURL, options, (data) => {
      setSearchData(data)
      dispatch(setFormBusy(false))
    })
  }

  const onSubmitSearchForm = (art, quantity) => {
    devMode && console.log('onSubmitSearchForm', art, quantity)

    if (String(art).length) {
      dispatch(setFormBusy(true))

      setSearchData({})
      setTimeout(() => {
        history
          .push(
            {
              pathname: '/search/',
              query: { art: art, q: quantity || 1 },
            },
            undefined,
            { shallow: true }
          )
          .then(() => {
            sendSearchRequest({
              q: art,
              c: quantity || 1,
            })
          })
      }, 1)

      //history
      //  .replace({
      //    pathname: '/search/',
      //    search: `art=${encodeURIComponent(art)}&q=${encodeURIComponent(quantity || 1)}`,
      //    // state: { isActive: true },
      //  })
      //  .then((rpls) => {
      //    console.log('rpls', rpls)
      //
      //    sendSearchRequest({
      //      q: art,
      //      c: quantity || 1,
      //    })
      //  })
    }
    return false
  }

  const updateCart = (id = null, count = 0, cur = {}, clear = false) => {
    devMode && console.log('updateCart', id, count)

    let store = []
    const catpartMode = localStorage.getItem('catpart-mode')
    const catpartStore = localStorage.getItem('catpart')

    if (catpartStore && catpartStore !== 'undefined') {
      const arr = getJsonData(catpartStore)

      if (Array.isArray(arr)) {
        store = arr
      }
    }

    if (clear) {
      store = []
    } else if (id) {
      const storeItem = store.find((f) => f.id === id)

      if (count === 0) {
        if (storeItem) {
          createNotification('success', `Удален: ${storeItem.name}`, `Количество: ${storeItem.cart}`)

          if (typeof ym === 'function') {
            ym(81774553, 'reachGoal', 'removedfromcart')
          }

          store = [...store.filter((f) => f.id !== id)]
        }
      } else if (storeItem) {
        if (storeItem.cart !== count) {
          storeItem.cart = count
          storeItem.cur = cur

          createNotification('success', `Обновлен: ${storeItem.name}`, `Количество: ${count}`)
        }
      } else {
        searchData.res.every((query) => {
          const item = query.data.find((f) => f.id === id)

          if (item) {
            createNotification('success', `Добавлен: ${item.name}`, `Количество: ${count}`)

            if (typeof window.ym === 'function') {
              window.ym(81774553, 'reachGoal', 'addtocart')
            }

            item.cart = count
            item.cur = cur
            store.push(item)

            return false
          }

          return true
        })
      }
    }

    new Promise((res, rej) => {
      if (id !== null && id < 0) {
        if (profileChecked) {
          if (profile.hasOwnProperty('id')) {
            if (catpartMode !== 'auth') {
              checkSupplierPrices(store, '', res)
            } else {
              res(store)
            }
          } else {
            if (catpartMode === 'auth') {
              checkSupplierPrices(store, '', res)
            } else {
              res(store)
            }
          }
        } else {
          res(store)
        }
      } else if (history.asPath === '/order') {
        checkSupplierPrices(store, 'Louisyen', res)
      } else {
        res(store)
      }
    }).then((store) => {
      localStorage.setItem('catpart', JSON.stringify(store))

      setCartData(store)

      if (profileChecked) {
        localStorage.setItem('catpart-mode', profile.hasOwnProperty('id') ? 'auth' : '')
      }

      console.log('store', store, history.asPath)

      setCartCount(store?.length || 0)

      if (store?.length > 0) {
        setTotalCart(
          store.reduce((total, c) => total + c.cart * c.pricebreaks[findPriceIndex(c.pricebreaks, c.cart)].price, 0)
        )
      }
    })
  }

  const updateAsideContent = (content) => {
    if (content !== null) {
      setAsideContent(content)
    }
  }

  const appState = {
    cartData: cartData,
    setCartData: setCartData,
    appDrag: appDrag,
    setAppDrag: setAppDrag,
    asideContent: asideContent,
    setAsideContent: setAsideContent,
    profileChecked: profileChecked,
    setProfileChecked: setProfileChecked,
    profile: profile,
    setProfile: setProfile,
    devMode: devMode,
    setDevMode: setDevMode,
    cartCount: cartCount,
    setCartCount: setCartCount,
    isAbove1500: isAbove1500,
    setIsAbove1500: setIsAbove1500,
    searchData: searchData,
    setSearchData: setSearchData,
    currencyList: currencyList,
    setCurrencyList: setCurrencyList,
    currency: currency,
    setCurrency: setCurrency,
    totalCart: totalCart,
    setTotalCart: setTotalCart,
    searchCount: searchCount,
    setSearchCount: setSearchCount,
    //openProfile: openProfile,
    //setOpenProfile: setOpenProfile,
    //openRequisites: openRequisites,
    //setOpenRequisites: setOpenRequisites,
    //openDetails: openDetails,
    //setOpenDetails: setOpenDetails,
  }

  const appFunctions = {
    onSubmitSearchForm: onSubmitSearchForm,
    updateCart: updateCart,
    checkSupplierPrices: checkSupplierPrices,
    needLogin: needLogin,
    logOut: logOut,
    notificationFunc: createNotification,
    sendSearchRequest: sendSearchRequest,
  }

  useEffect(() => {
    console.log('formBusy', formBusy, busyOrder)
    document.body.classList[formBusy ? 'add' : 'remove']('__busy')
  }, [formBusy])

  useEffect(() => {
    dispatch(setCloseAllMenus())
    dispatch(setFetchingDataInProgress(fetchingPage))
  }, [fetchingPage])

  useEffect(() => {
    updateAsideContent(openProfile ? <Profile {...appState} {...appFunctions} /> : null)
  }, [openProfile])

  useEffect(() => {
    updateAsideContent(
      openRequisites ? (
        <ProfileRequisites
          notificationFunc={createNotification}
          requisitesId={openRequisites ? openRequisites.id : null}
          profile={profile}
          requisites={openRequisites}
        />
      ) : null
    )
  }, [openRequisites])

  useEffect(() => {
    updateAsideContent(
      openDetails ? (
        <OrderDetails
          notificationFunc={createNotification}
          detailsId={openDetails ? openDetails.id : null}
          profile={profile}
          devMode={devMode}
          order={openDetails}
        />
      ) : null
    )
  }, [openDetails])

  useEffect(() => {
    if (!profile.hasOwnProperty('id')) {
      dispatch(setOpenProfile(false))
    }
  }, [profile])

  useEffect(() => {
    if (!asideOpen) {
      setAsideContent(null)
      dispatch(setOpenRequisites(-1))
      dispatch(setOpenDetails(0))
    }
  }, [asideOpen])

  useEffect(() => {
    updateCart(-1)
  }, [profile])

  useEffect(() => {
    dispatch(setOrderSent(true))
  }, [history.asPath])

  useEffect(() => {
    setDevMode(process.env.NODE_ENV !== 'production')
  }, [])

  return (
    <SWRConfig
      value={{
        onError: (error, key) => {
          if (error.status !== 403 && error.status !== 404) {
            // We can send the error to Sentry,
            // or show a notification UI.
          }
        },
      }}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      {process.env.NODE_ENV === 'production' ? (
        <React.Fragment>
          <Script
            id="window_dl_script"
            dangerouslySetInnerHTML={{
              __html: `
      window.dataLayer = window.dataLayer || [];
      window.gTag = (dl) => {
        window.dataLayer.push(dl);
      }
        `,
            }}
          />

          <Script
            id="gtm_script"
            dangerouslySetInnerHTML={{
              __html: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-WVWK2SW');              
                    `,
            }}
          />
        </React.Fragment>
      ) : null}

      <Layout {...appState} {...appFunctions} catalogMenu={catalogMenu}>
        <Component
          {...appState}
          {...appFunctions}
          {...pageProps}
          catalogData={catalogData}
          searchData={searchData}
          errorData={errorData}
          pageData={pageData}
        />
      </Layout>

      <AsideContainer className={asideOpen && asideContent !== null ? ' __opened' : ''}>{asideContent}</AsideContainer>

      <ReactNotifications />
    </SWRConfig>
  )
}

export default NextCatpartApp
