import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setOpenMobMenu } from '../../../store/menus/action'

import CatalogueMenu from '@/components/CatalogueMenu'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import LoadingIndicator from '@/components/LoadingIndicator'
import SearchForm from '@/components/SearchForm'
import { getJsonData } from '@/utils/getJsonData'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import { validateJSON } from '@/utils/validateJSON'

function Layout(pageProps) {
  const history = useRouter()
  const dispatch = useDispatch()

  const { children, appDrag, setAppDrag, setProfileChecked, setProfile, catalogMenu } = pageProps
  const { openMobMenu } = useSelector((state) => state.menus)
  const { tableHeadFixed, fetchingDataInProgress, formBusy } = useSelector((state) => state.search)
  const { orderSent } = useSelector((state) => state.cart)

  const [centeredForm, setCenteredForm] = useState(true)

  const appHeight = () => {
    const doc = document.documentElement
    const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0
    doc.style.setProperty('--app-height', `${Math.max(700, window.innerHeight - sab)}px`)
  }

  const handleScroll = (event) => {
    if (openMobMenu) {
      dispatch(setOpenMobMenu(false))
    }

    document.body.classList[document.body.scrollTop > 0 ? 'add' : 'remove']('__show-gotop')
  }

  useEffect(() => {
    // TODO catalogue menu list

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
    window.log = ['localhost', 'html'].indexOf(location.hostname.split('.')[0]) > -1
  }, [])

  const watchLocation = typeof window === 'undefined' ? '' : window.location.pathname

  useEffect(() => {
    console.log('render Layout', orderSent, formBusy, watchLocation === '/', history)

    setCenteredForm(!formBusy && watchLocation === '/')
  }, [formBusy, watchLocation, orderSent])

  return (
    <div className={`app-wrapper${appDrag ? ' __over' : ''}`}>
      <Header {...pageProps} />

      {/*<Clock lastUpdate={tick.lastUpdate} light={tick.light} />*/}

      <div
        aria-hidden="true"
        className="btn btn__gotop icon icon-chevron-up"
        onClick={() => {
          smoothScrollTo(document.body, document.body.scrollTop, 0, 600)
        }}
      />

      <CatalogueMenu catalogMenu={catalogMenu} />

      <main className={`main${centeredForm && !orderSent ? ' __center' : ''}`}>
        <SearchForm {...pageProps} />

        <div className="main-content">
          {orderSent ? (
            <article className="article text-center __lg">
              <h1 className="article-title">Готово! Заказ отправлен!</h1>
              <p>Спасибо за заказ. В течение 5 минут счет будет на вашей почте.</p>
            </article>
          ) : (
            children
          )}
        </div>

        {/*{fetchingDataInProgress && fetchingDataInProgress !== 'search' ? (*/}
        {/*  <LoadingIndicator page={fetchingDataInProgress} />*/}
        {/*) : (*/}
        {/*  <div className="main-content">{children}</div>*/}
        {/*)}*/}

        {tableHeadFixed}
      </main>

      <Footer />
    </div>
  )
}

export default Layout
