import { useRouter } from 'next/router'
import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setCloseAllMenus, setOpenCatalogue } from '../../../store/menus/action'

import NextLink from '@/components/NextLink'

function CatalogueMenu(props) {
  const dispatch = useDispatch()
  const router = useRouter()

  const { openCatalogue } = useSelector((state) => state.menus)
  const { catalogMenu } = props

  let menuTimer
  const [menuPath, setMenuPath] = useState('0')

  const menuTreeBuilder = (menu, level = 0, parent = '0', ret = []) => {
    let sub = []

    menu?.forEach((m, mi) => {
      ret.push(
        <div
          className={'catalogue__list-item'}
          key={`key_${parent}_${level}_${mi}`}
          onMouseEnter={() => {
            clearTimeout(menuTimer)
            menuTimer = setTimeout(() => {
              setMenuPath(`${parent}-${mi}`)
            }, 300)
          }}
        >
          <NextLink
            aria-hidden="true"
            to={'/' + (m.slug || '#') + '/'}
            //as={'/catalog'}
            className={
              'catalogue__list-link' +
              (JSON.stringify(menuPath.split('-').slice(0, level + 2)) === JSON.stringify(`${parent}-${mi}`.split('-'))
                ? ' __active'
                : '')
            }
            //onClick={(e) => {
            //  console.log('onClick', e)
            //  //e.preventDefault()
            //  dispatch(setCloseAllMenus())
            //  if (e.target.classList.contains('__active')) {
            //    router.push('/' + (m.slug || '#')).then(() => {
            //      console.log('catalog click')
            //    })
            //  }
            //  //return false
            //}}
          >
            {m.name}
          </NextLink>
        </div>
      )

      if (m.children) {
        sub.push(menuTreeBuilder(m.children, level + 1, `${parent}-${mi}`))
      }
    })

    return (
      <React.Fragment key={'fragment_' + parent}>
        <div
          className={
            'catalogue__list __level-' +
            level +
            (JSON.stringify(menuPath.split('-').slice(0, level + 1)) === JSON.stringify(parent.split('-'))
              ? ' __show'
              : '')
          }
        >
          {ret}
        </div>
        {sub}
      </React.Fragment>
    )
  }

  const catalogHTML = useMemo(() => {
    return menuTreeBuilder(catalogMenu)
  }, [catalogMenu])

  return catalogMenu?.length ? (
    <div className={'catalogue' + (openCatalogue ? ' __open' : '')}>
      <div className="catalogue__inner">{catalogHTML}</div>
    </div>
  ) : null
}

export default CatalogueMenu
