import './../src/styles/app.scss'

import { Provider, useAtom } from 'jotai'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import React, { useEffect } from 'react'
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
} from '@/store/store'
import { findPriceIndex } from '@/utils/findPriceIndex'
import { getJsonData } from '@/utils/getJsonData'
import apiGET from '@/utils/search'
import apiPOST from '@/utils/upload'

function MyApp({ Component, pageProps }) {
  const { initialState } = pageProps
  const history = useRouter()

  const [asideOpen, setAsideOpen] = useAtom(asideOpenJotai)
  const [asideContent, setAsideContent] = useAtom(asideContentJotai)
  const [openAuthPopup, setOpenAuthPopup] = useAtom(openAuthPopupJotai)
  const [openCatalogue, setOpenCatalogue] = useAtom(openCatalogueJotai)
  const [openMobMenu, setOpenMobMenu] = useAtom(openMobMenuJotai)
  const [busyOrder, setBusyOrder] = useAtom(busyOrderJotai)
  const [searchData, setSearchData] = useAtom(searchDataJotai)
  const [profileChecked, setProfileChecked] = useAtom(profileCheckedJotai)
  const [profile, setProfile] = useAtom(profileJotai)
  const [devMode, setDevMode] = useAtom(isDevModeJotai)
  const [cartCount, setCartCount] = useAtom(cartCountJotai)
  const [isAbove1500, setIsAbove1500] = useAtom(isAbove1500Jotai)
  const [currencyList, setCurrencyList] = useAtom(currencyListJotai)
  const [totalCart, setTotalCart] = useAtom(totalCartJotai)
  const [formBusy, setFormBusy] = useAtom(formBusyJotai)
  const [searchCount, setSearchCount] = useAtom(searchCountJotai)
  const [globalPageStatus, setGlobalPageStatus] = useAtom(globalPageStatusJotai)

  const [openProfile, setOpenProfile] = useAtom(openProfileJotai)
  const [openRequisites, setOpenRequisites] = useAtom(openRequisitesJotai)
  const [openDetails, setOpenDetails] = useAtom(openDetailsJotai)

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

  useEffect(() => {
    if (openAuthPopup || openRequisites) {
      setOpenCatalogue(false)
    }
  }, [openAuthPopup, openRequisites])

  useEffect(() => {
    document.body.classList[openCatalogue ? 'add' : 'remove']('__no-overflow')
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
    setAsideOpen(openProfile)
    updateAsideContent(openProfile ? <Profile notificationFunc={createNotification} logOut={logOut} /> : null)
  }, [openProfile])

  useEffect(() => {
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
    setAsideOpen(openDetails?.id)

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

      {/*      <Script*/}
      {/*        id="window_dl_script"*/}
      {/*        dangerouslySetInnerHTML={{*/}
      {/*          __html: `*/}
      {/*window.dataLayer = window.dataLayer || [];*/}
      {/*window.gTag = (dl) => {*/}
      {/*  window.dataLayer.push(dl);*/}
      {/*}*/}
      {/*  `,*/}
      {/*        }}*/}
      {/*      />*/}

      {/*      <Script*/}
      {/*        id="gtm_script"*/}
      {/*        dangerouslySetInnerHTML={{*/}
      {/*          __html: `*/}
      {/*(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':*/}
      {/*new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],*/}
      {/*j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=*/}
      {/*'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);*/}
      {/*})(window,document,'script','dataLayer','GTM-WVWK2SW');              */}
      {/*              `,*/}
      {/*        }}*/}
      {/*      />*/}

      <Provider initialValues={initialState}>
        <Layout
          onSubmitSearchForm={onSubmitSearchForm}
          updateCart={updateCart}
          checkSupplierPrices={checkSupplierPrices}
          needLogin={needLogin}
          logOut={logOut}
          createNotification={createNotification}
        >
          <Component
            apiGETBridge={apiGETBridge}
            sendSearchRequest={sendSearchRequest}
            updateCart={updateCart}
            needLogin={needLogin}
            logOut={logOut}
            createNotification={createNotification}
            {...pageProps}
          />
        </Layout>

        <AsideContainer className={asideOpen ? ' __opened' : ''} setAsideOpen={setAsideOpen}>
          {asideContent}
        </AsideContainer>
      </Provider>
    </React.Fragment>
  )
}

export default MyApp
