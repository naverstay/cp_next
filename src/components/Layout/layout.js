import { useState } from 'react'
import ReactNotification, { store } from 'react-notifications-component'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import SearchForm from '@/components/SearchForm'
import { findPriceIndex } from '@/utils/findPriceIndex'
import { getJsonData } from '@/utils/getJsonData'
import apiGET from '@/utils/search'
import apiPOST from '@/utils/upload'

const LOUISYEN_PRICE_LIMIT = 1500

export default function Layout({ history, children }) {
  const [tableHeadFixed, setTableHeadFixed] = useState(null)
  const [appDrag, setAppDrag] = useState(false)
  const [centeredForm, setCenteredForm] = useState(true)
  const [openAuthPopup, setOpenAuthPopup] = useState(false)
  const [searchData, setSearchData] = useState({})
  const [openMobMenu, setOpenMobMenu] = useState(false)
  const [openCatalogue, setOpenCatalogue] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)
  const [profile, setProfile] = useState({})
  const [searchCount, setSearchCount] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [totalCart, setTotalCart] = useState(0)
  const [globalPageStatus, setGlobalPageStatus] = useState(200)

  const [isAbove1500, setIsAbove1500] = useState(false)
  const [formBusy, setFormBusy] = useState(false)
  const [searchResult, setSearchResult] = useState(false)

  const [busyOrder, setBusyOrder] = useState(false)
  const [errorPage, setErrorPage] = useState(false)

  const getUSDExchange = () => {
    const USD = currencyList.find((f) => f.name === 'USD')
    return USD && USD.hasOwnProperty('exChange') ? USD.exChange : 1
  }

  const updateLocationParams = (loc) => {
    // console.log("updateLocationParams", loc);
    setCenteredForm(loc.pathname === '/')
  }

  const checkSupplierPrices = (store, supplier, done) => {
    const filteredItems = store.filter((f) => (supplier ? f.supplier === supplier : true))

    window.log && console.log('filteredItems', filteredItems)

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

  const sendSearchRequest = (options) => {
    const requestURL = '/search'
    setSearchResult(true)
    setFormBusy(true)

    setSearchData({})

    setSearchCount(options.c || 1)

    if (typeof ym === 'function') {
      ym(81774553, 'reachGoal', 'usedsearch')
    }

    apiGET(requestURL, options, (data) => {
      setFormBusy(false)
      setSearchData(data)
    })
  }

  const onSubmitSearchForm = (art, quantity) => {
    window.log && console.log('onSubmitSearchForm', art, quantity)

    if (art.length) {
      history.replace({
        pathname: '/search/',
        search: `art=${encodeURIComponent(art)}&q=${encodeURIComponent(quantity || 1)}`,
        state: { isActive: true },
      })

      // history.push();
      sendSearchRequest({
        q: art,
        c: quantity || 1,
      })
    }
    return false
  }

  const appHeight = () => {
    const doc = document.documentElement
    const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0
    doc.style.setProperty('--app-height', `${Math.max(700, window.innerHeight - sab)}px`)
  }

  const handleScroll = (event) => {
    setOpenMobMenu(false)

    document.body.classList[document.body.scrollTop > 0 ? 'add' : 'remove']('__show-gotop')
    // setPageY(event.target.scrollTop);
  }

  const apiGETBridge = (requestURL, options, cb) => {
    apiGET(requestURL, options, (data) => {
      setGlobalPageStatus(data.hasOwnProperty('error') ? 404 : 200)

      if (typeof cb === 'function') {
        cb(data)
      }
    })
  }

  const createNotification = (type, title, text) => {
    window.log && console.log('createNotification', type, text)

    switch (type) {
      case 'info':
        break
      case 'success':
        store.addNotification({
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

  const updateCart = (id = null, count = 0, cur = {}, clear = false) => {
    window.log && console.log('updateCart', id, count)

    let store = []
    const catpartMode = localStorage.getItem('catpart-mode')
    const catpartStore = localStorage.getItem('catpart')

    if (catpartStore && catpartStore !== 'undefined') {
      store = getJsonData(catpartStore)
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

            if (typeof ym === 'function') {
              ym(81774553, 'reachGoal', 'addtocart')
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
      if (id < 0) {
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

      setCartCount(store.length)

      if (store.length) {
        setTotalCart(
          store.reduce((total, c) => total + c.cart * c.pricebreaks[findPriceIndex(c.pricebreaks, c.cart)].price, 0)
        )
      } else if (window.location.pathname === '/order' && !clear) {
        history.push('/')
      }
    })
  }

  return (
    <div className={`app-wrapper${appDrag ? ' __over' : ''}`}>
      <Header
        setOpenAuthPopup={setOpenAuthPopup}
        openAuthPopup={openAuthPopup}
        notificationFunc={createNotification}
        setProfile={setProfile}
        history={history}
        profile={profile}
        cartCount={cartCount}
        openMobMenu={openMobMenu}
        setOpenMobMenu={setOpenMobMenu}
        setOpenCatalogue={setOpenCatalogue}
        openCatalogue={openCatalogue}
      />

      <main className={`main${centeredForm ? ' __center' : ''}`}>
        <SearchForm
          setFormBusy={setFormBusy}
          history={history}
          setSearchData={setSearchData}
          setOpenCatalogue={setOpenCatalogue}
          setOpenMobMenu={setOpenMobMenu}
          busyOrder={busyOrder}
          busy={formBusy}
          onSubmitForm={onSubmitSearchForm}
          notificationFunc={createNotification}
        />

        <div className="main-content">{children}</div>

        {tableHeadFixed}
      </main>

      <Footer />
    </div>
  )
}
