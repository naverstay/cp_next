import { useRouter } from 'next/router'
import React from 'react'
import { useState, useEffect } from 'react'

import CatalogueMenu from '@/components/CatalogueMenu'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import SearchForm from '@/components/SearchForm'
import { flatDeep } from '@/utils/flatDeep'
import { getJsonData } from '@/utils/getJsonData'
import apiGET from '@/utils/search'
import { smoothScrollTo } from '@/utils/smoothScrollTo'
import { uniqArray } from '@/utils/uniqArray'
import { validateJSON } from '@/utils/validateJSON'

export default function Layout(props) {
  const history = useRouter()

  const {
    devMode,
    children,
    setOpenMobMenu,
    setCategorySlugLinks,
    menuJson,
    setMenuJson,
    tableHeadFixed,
    appDrag,
    setAppDrag,
    setProfileChecked,
    profile,
    setProfile,
    openCatalogue,
    setOpenCatalogue,
  } = props

  const appHeight = () => {
    const doc = document.documentElement
    const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0
    doc.style.setProperty('--app-height', `${Math.max(700, window.innerHeight - sab)}px`)
  }

  const handleScroll = (event) => {
    setOpenMobMenu(false)

    document.body.classList[document.body.scrollTop > 0 ? 'add' : 'remove']('__show-gotop')
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
    window.log = ['localhost', 'html'].indexOf(location.hostname.split('.')[0]) > -1
  }, [])

  return (
    <div className={`app-wrapper${appDrag ? ' __over' : ''}`}>
      <Header {...props} />

      <div
        aria-hidden="true"
        className="btn btn__gotop icon icon-chevron-up"
        onClick={() => {
          smoothScrollTo(document.body, document.body.scrollTop, 0, 600)
        }}
      />

      <CatalogueMenu
        menuJson={menuJson}
        setMenuJson={setMenuJson}
        setOpenCatalogue={setOpenCatalogue}
        openCatalogue={openCatalogue}
      />

      <main className={`main${history.asPath === '/' ? ' __center' : ''}`}>
        <SearchForm {...props} />

        <div className="main-content">{children}</div>

        {tableHeadFixed}
      </main>

      <Footer />
    </div>
  )
}
