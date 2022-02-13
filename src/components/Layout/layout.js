import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import React from 'react'
import { useState, useEffect } from 'react'
import ReactNotification, { store } from 'react-notifications-component'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import OrderDetails from '@/components/OrderDetails'
import Profile from '@/components/Profile'
import ProfileRequisites from '@/components/ProfileRequisites'
import SearchForm from '@/components/SearchForm'
import { LOUISYEN_PRICE_LIMIT } from '@/store/constants'
import {
  appDragJotai,
  asideContentJotai,
  asideOpenJotai,
  busyOrderJotai,
  cartCountJotai,
  categorySlugLinksJotai,
  currencyListJotai,
  errorPageJotai,
  formBusyJotai,
  globalPageStatusJotai,
  isAbove1500Jotai,
  menuJsonJotai,
  openAuthPopupJotai,
  openCatalogueJotai,
  openDetailsJotai,
  openMobMenuJotai,
  openProfileJotai,
  openRequisitesJotai,
  orderSentJotai,
  pageYJotai,
  profileCheckedJotai,
  profileJotai,
  profileRequisitesJotai,
  searchCountJotai,
  searchDataJotai,
  tableHeadFixedJotai,
  totalCartJotai,
} from '@/store/store'
import { findPriceIndex } from '@/utils/findPriceIndex'
import { flatDeep } from '@/utils/flatDeep'
import { getJsonData } from '@/utils/getJsonData'
import apiGET from '@/utils/search'
import { uniqArray } from '@/utils/uniqArray'
import apiPOST from '@/utils/upload'
import { validateJSON } from '@/utils/validateJSON'

export default function Layout({ children }) {
  const history = useRouter()

  //const [openMobMenu, setOpenMobMenu] = useState(false)
  const [openMobMenu, setOpenMobMenu] = useAtom(openMobMenuJotai)
  const [categorySlugLinks, setCategorySlugLinks] = useAtom(categorySlugLinksJotai)
  const [menuJson, setMenuJson] = useAtom(menuJsonJotai)
  const [tableHeadFixed, setTableHeadFixed] = useAtom(tableHeadFixedJotai)
  const [searchData, setSearchData] = useAtom(searchDataJotai)
  const [openCatalogue, setOpenCatalogue] = useAtom(openCatalogueJotai)
  const [orderSent, setOrderSent] = useAtom(orderSentJotai)

  const [searchCount, setSearchCount] = useAtom(searchCountJotai)
  const [cartCount, setCartCount] = useAtom(cartCountJotai)
  const [totalCart, setTotalCart] = useAtom(totalCartJotai)
  const [globalPageStatus, setGlobalPageStatus] = useAtom(globalPageStatusJotai)
  const [openAuthPopup, setOpenAuthPopup] = useAtom(openAuthPopupJotai)

  const [appDrag, setAppDrag] = useAtom(appDragJotai)

  const [formBusy, setFormBusy] = useAtom(formBusyJotai)
  const [busyOrder, setBusyOrder] = useAtom(busyOrderJotai)

  const [profileChecked, setProfileChecked] = useAtom(profileCheckedJotai)
  const [profile, setProfile] = useAtom(profileJotai)
  const [profileRequisites, setProfileRequisites] = useAtom(profileRequisitesJotai)
  const [openProfile, setOpenProfile] = useAtom(openProfileJotai)
  const [openRequisites, setOpenRequisites] = useAtom(openRequisitesJotai)
  const [openDetails, setOpenDetails] = useAtom(openDetailsJotai)
  const [asideOpen, setAsideOpen] = useAtom(asideOpenJotai)
  const [asideContent, setAsideContent] = useAtom(asideContentJotai)
  const [isAbove1500, setIsAbove1500] = useAtom(isAbove1500Jotai)
  const [currencyList, setCurrencyList] = useAtom(currencyListJotai)

  const getUSDExchange = () => {
    const USD = currencyList.find((f) => f.name === 'USD')
    return USD && USD.hasOwnProperty('exChange') ? USD.exChange : 1
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
      history
        .replace({
          pathname: '/search/',
          search: `art=${encodeURIComponent(art)}&q=${encodeURIComponent(quantity || 1)}`,
          state: { isActive: true },
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

  const appHeight = () => {
    const doc = document.documentElement
    const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0
    doc.style.setProperty('--app-height', `${Math.max(700, window.innerHeight - sab)}px`)
  }

  const handleScroll = (event) => {
    setOpenMobMenu(false)

    document.body.classList[document.body.scrollTop > 0 ? 'add' : 'remove']('__show-gotop')
  }

  const apiGETBridge = (requestURL, options, cb) => {
    apiGET(requestURL, options, (data) => {
      setGlobalPageStatus(data.hasOwnProperty('error') ? 404 : 200)

      if (typeof cb === 'function') {
        cb(data)
      }
    })
  }

  const updateAsideContent = (content) => {
    if (content !== null) {
      setAsideContent(content)
    }
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

  const logOut = () => {
    window.log && console.log('logOut')
    localStorage.removeItem('access_token')
    localStorage.removeItem('catpart-profile')
    history.push('/')
    setProfile({})
    setProfileChecked(true)
  }

  const needLogin = () => {
    window.log && console.log('needLogin', profile)
    logOut()
    createNotification('success', `Требуется авторизация`, ' ')
  }

  useEffect(() => {
    // TODO catalogue menu list
    const requestURL = '/catalog/categories'

    apiGET(requestURL, {}, (data) => {
      if (data && data.length) {
        let uniqueArray = uniqArray(flatDeep(data))
        setCategorySlugLinks(uniqueArray)
        setMenuJson(data)
      }
    })

    const profileLS = localStorage.getItem('catpart-profile')

    if (profileLS) {
      if (validateJSON(profileLS)) {
        setProfile(getJsonData(profileLS))
      } else {
        localStorage.removeItem('catpart-profile')
      }
    }

    document.body.addEventListener('scroll', handleScroll)

    window.addEventListener('resize', appHeight)

    appHeight()

    if ('ontouchstart' in document.documentElement) {
      document.body.style.cursor = 'pointer'
    }

    const dropContainer = document.getElementById('__next')

    dropContainer.ondragover = dropContainer.ondragenter = function (evt) {
      evt.stopPropagation()
      evt.preventDefault()
      setAppDrag(true)
    }

    dropContainer.ondragleave = function (evt) {
      evt.stopPropagation()
      evt.preventDefault()
      setAppDrag(false)
    }

    dropContainer.ondrop = function (evt) {
      evt.stopPropagation()
      evt.preventDefault()

      const fileInput = document.getElementById('file')

      setAppDrag(false)

      const dT = new DataTransfer()

      dT.items.add(evt.dataTransfer.files[0])

      fileInput.files = dT.files

      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    }

    setProfileChecked(true)

    return () => {
      document.body.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', appHeight)

      dropContainer.ondragover = null

      dropContainer.ondragleave = null

      dropContainer.ondrop = null
    }
  }, [])

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

  useEffect(() => {
    window.log = ['localhost', 'html'].indexOf(location.hostname.split('.')[0]) > -1
  }, [])

  return (
    <div className={`app-wrapper${appDrag ? ' __over' : ''}`}>
      <Header notificationFunc={createNotification} />

      <main className={`main${history.asPath === '/' ? ' __center' : ''}`}>
        <SearchForm
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
