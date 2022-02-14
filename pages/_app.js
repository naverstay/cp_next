import './../src/styles/app.scss'

import { Provider, useAtom } from 'jotai'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import React, { useEffect, useState } from 'react'
import ReactNotification, { Store } from 'react-notifications-component'

import AsideContainer from '@/components/AsideContainer'
import Layout from '@/components/Layout/layout'
import OrderDetails from '@/components/OrderDetails'
import Profile from '@/components/Profile'
import ProfileRequisites from '@/components/ProfileRequisites'
import { LOUISYEN_PRICE_LIMIT } from '@/store/constants'
import {
  asideContentJotai,
  asideOpenJotai,
  busyOrderJotai,
  cartCountJotai,
  currencyListJotai,
  formBusyJotai,
  globalPageStatusJotai,
  isAbove1500Jotai,
  isDevModeJotai,
  openAuthPopupJotai,
  openCatalogueJotai,
  openDetailsJotai,
  openMobMenuJotai,
  openProfileJotai,
  openRequisitesJotai,
  profileCheckedJotai,
  profileJotai,
  searchCountJotai,
  searchDataJotai,
  totalCartJotai,
  simpleReducer,
  categorySlugLinksJotai,
  menuJsonJotai,
  tableHeadFixedJotai,
  appDragJotai,
  openResetPasswordJotai,
  errorPageJotai,
  currencyJotai,
  showTableHeadFixedJotai,
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

function NextCatpartApp({ Component, pageProps }) {
  const { initialState } = pageProps
  const history = useRouter()

  const [categorySlugLinks, setCategorySlugLinks] = useState(categorySlugLinksJotai)
  const [menuJson, setMenuJson] = useState(menuJsonJotai)
  const [tableHeadFixed, setTableHeadFixed] = useState(tableHeadFixedJotai)
  const [appDrag, setAppDrag] = useState(appDragJotai)
  const [errorPage, setErrorPage] = useState(errorPageJotai)
  const [showTableHeadFixed, setShowTableHeadFixed] = useState(showTableHeadFixedJotai)

  const [asideOpen, setAsideOpen] = useState(asideOpenJotai)
  const [asideContent, setAsideContent] = useState(asideContentJotai)
  const [openResetPassword, setOpenResetPassword] = useState(openResetPasswordJotai)
  const [openAuthPopup, setOpenAuthPopup] = useState(openAuthPopupJotai)
  const [openCatalogue, setOpenCatalogue] = useState(openCatalogueJotai)
  const [openMobMenu, setOpenMobMenu] = useState(openMobMenuJotai)
  const [busyOrder, setBusyOrder] = useState(busyOrderJotai)
  const [searchData, setSearchData] = useState(searchDataJotai)
  const [profileChecked, setProfileChecked] = useState(profileCheckedJotai)
  const [profile, setProfile] = useState(profileJotai)
  const [devMode, setDevMode] = useState(isDevModeJotai)
  const [cartCount, setCartCount] = useState(cartCountJotai)
  const [isAbove1500, setIsAbove1500] = useState(isAbove1500Jotai)
  const [currency, setCurrency] = useState(currencyJotai)

  const [currencyList, setCurrencyList] = useState(currencyListJotai)
  const [totalCart, setTotalCart] = useState(totalCartJotai)
  const [formBusy, setFormBusy] = useState(formBusyJotai)
  const [searchCount, setSearchCount] = useState(searchCountJotai)
  const [globalPageStatus, setGlobalPageStatus] = useState(globalPageStatusJotai)

  const [openProfile, setOpenProfile] = useState(openProfileJotai)
  const [openRequisites, setOpenRequisites] = useState(openRequisitesJotai)
  const [openDetails, setOpenDetails] = useState(openDetailsJotai)

  const getUSDExchange = () => {
    const USD = currencyList.find((f) => f.name === 'USD')
    return USD && USD.hasOwnProperty('exChange') ? USD.exChange : 1
  }

  const createNotification = (type, title, text) => {
    devMode && console.log('createNotification', type, text)

    if (Store?.add) {
      console.log('store', Store)

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
    } else {
      console.log('no store', Store)
    }
  }

  const logOut = () => {
    devMode && console.log('logOut')
    localStorage.removeItem('access_token')
    localStorage.removeItem('catpart-profile')
    history.push('/')
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

    setFormBusy(true)

    setSearchData({})

    setSearchCount(+(options?.c || 1))

    if (typeof ym === 'function') {
      ym(81774553, 'reachGoal', 'usedsearch')
    }

    apiGET(requestURL, options, (data) => {
      setFormBusy(false)
      setSearchData(data)
    })
  }

  const onSubmitSearchForm = (art, quantity) => {
    devMode && console.log('onSubmitSearchForm', art, quantity)

    if (String(art).length) {
      history
        .replace({
          pathname: '/search/',
          search: `art=${encodeURIComponent(art)}&q=${encodeURIComponent(quantity || 1)}`,
          // state: { isActive: true },
        })
        .then((rpls) => {
          console.log('rpls', rpls)
        })

      // history.push();
      sendSearchRequest({
        q: art,
        c: quantity || 1,
      })
    }
    return false
  }

  const apiGETBridge = (requestURL, options, cb) => {
    apiGET(requestURL, options, (data) => {
      setGlobalPageStatus(data.hasOwnProperty('error') ? 404 : 200)

      if (typeof cb === 'function') {
        cb(data)
      }
    })
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
      } else if (window.location.pathname === '/order') {
        checkSupplierPrices(store, 'Louisyen', res)
      } else {
        res(store)
      }
    }).then((store) => {
      localStorage.setItem('catpart', JSON.stringify(store))

      if (profileChecked) {
        localStorage.setItem('catpart-mode', profile.hasOwnProperty('id') ? 'auth' : '')
      }

      setCartCount(store?.length || 0)

      if (store?.length) {
        setTotalCart(
          store.reduce((total, c) => total + c.cart * c.pricebreaks[findPriceIndex(c.pricebreaks, c.cart)].price, 0)
        )
      } else if (window.location.pathname === '/order' && !clear) {
        history.push('/')
      }
    })
  }

  const updateAsideContent = (content) => {
    console.log('updateAsideContent', content)
    if (content !== null) {
      setAsideContent(content)
    }
  }

  const ReactNotificationFunc = () => {
    return (
      <React.Fragment>
        <ReactNotification />
      </React.Fragment>
    )
  }

  const appState = {
    showTableHeadFixed: showTableHeadFixed,
    setShowTableHeadFixed: setShowTableHeadFixed,
    errorPage: errorPage,
    setErrorPage: setErrorPage,
    categorySlugLinks: categorySlugLinks,
    setCategorySlugLinks: setCategorySlugLinks,
    menuJson: menuJson,
    setMenuJson: setMenuJson,
    tableHeadFixed: tableHeadFixed,
    setTableHeadFixed: setTableHeadFixed,
    appDrag: appDrag,
    setAppDrag: setAppDrag,
    asideOpen: asideOpen,
    setAsideOpen: setAsideOpen,
    asideContent: asideContent,
    setAsideContent: setAsideContent,
    openResetPassword: openResetPassword,
    setOpenResetPassword: setOpenResetPassword,
    openAuthPopup: openAuthPopup,
    setOpenAuthPopup: setOpenAuthPopup,
    openCatalogue: openCatalogue,
    setOpenCatalogue: setOpenCatalogue,
    openMobMenu: openMobMenu,
    setOpenMobMenu: setOpenMobMenu,
    busyOrder: busyOrder,
    setBusyOrder: setBusyOrder,
    searchData: searchData,
    setSearchData: setSearchData,
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
    currencyList: currencyList,
    setCurrencyList: setCurrencyList,
    currency: currency,
    setCurrency: setCurrency,
    totalCart: totalCart,
    setTotalCart: setTotalCart,
    formBusy: formBusy,
    setFormBusy: setFormBusy,
    searchCount: searchCount,
    setSearchCount: setSearchCount,
    globalPageStatus: globalPageStatus,
    setGlobalPageStatus: setGlobalPageStatus,
    openProfile: openProfile,
    setOpenProfile: setOpenProfile,
    openRequisites: openRequisites,
    setOpenRequisites: setOpenRequisites,
    openDetails: openDetails,
    setOpenDetails: setOpenDetails,
  }

  const appFunctions = {
    onSubmitSearchForm: onSubmitSearchForm,
    updateCart: updateCart,
    checkSupplierPrices: checkSupplierPrices,
    needLogin: needLogin,
    logOut: logOut,
    createNotification: createNotification,
    apiGETBridge: apiGETBridge,
    sendSearchRequest: sendSearchRequest,
  }

  useEffect(() => {
    if (openAuthPopup || openRequisites) {
      setOpenCatalogue(false)
    }
  }, [openAuthPopup, openRequisites])

  useEffect(() => {
    document.body.classList[openCatalogue ? 'add' : 'remove']('__no-overflow')

    if (openCatalogue) {
      setOpenAuthPopup(false)
      setOpenResetPassword(false)
    }
  }, [openCatalogue])

  useEffect(() => {
    document.body.classList[formBusy || busyOrder ? 'add' : 'remove']('__busy')
  }, [formBusy, busyOrder])

  useEffect(() => {
    if (openMobMenu) {
      setOpenCatalogue(false)
    }
  }, [openMobMenu])

  useEffect(() => {
    if (openCatalogue) {
      setOpenMobMenu(false)
    }
  }, [openCatalogue])

  useEffect(() => {
    console.log('openProfile', openProfile)
    setAsideOpen(openProfile)
    updateAsideContent(openProfile ? <Profile {...appState} {...appFunctions} /> : null)
  }, [openProfile])

  useEffect(() => {
    console.log('openRequisites', openRequisites)
    setAsideOpen(!!openRequisites)

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
    console.log('openDetails', openDetails)
    setAsideOpen(!!openDetails?.id)

    updateAsideContent(
      openDetails ? (
        <OrderDetails
          notificationFunc={createNotification}
          detailsId={openDetails ? openDetails.id : null}
          profile={profile}
          order={openDetails}
        />
      ) : null
    )
  }, [openDetails])

  useEffect(() => {
    if (!profile.hasOwnProperty('id')) {
      setOpenProfile(false)
    }
  }, [profile])

  useEffect(() => {
    console.log('asideOpen', asideOpen)
    if (!asideOpen) {
      setOpenProfile(false)
      setOpenRequisites(0)
      setOpenDetails(0)
    }
  }, [asideOpen])

  useEffect(() => {
    console.log('prev', profile)
    // if (profileChecked) {
    updateCart(-1)
    // }
  }, [profile])

  useEffect(() => {
    setDevMode(process.env.NODE_ENV !== 'production')
  }, [])

  return (
    <React.Fragment>
      <Head>
        <base href="/" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#475df4" />

        <link rel="icon" href="./favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
        <link rel="manifest" href="./site.webmanifest" crossOrigin="use-credentials" />

        <link rel="mask-icon" href="./safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
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

      <Provider initialValues={initialState}>
        <Layout {...appState} {...appFunctions}>
          <Component {...appState} {...appFunctions} {...pageProps} />
        </Layout>

        <AsideContainer className={asideOpen ? ' __opened' : ''} setAsideOpen={setAsideOpen}>
          {asideContent}
        </AsideContainer>
      </Provider>
    </React.Fragment>
  )
}

export default NextCatpartApp
