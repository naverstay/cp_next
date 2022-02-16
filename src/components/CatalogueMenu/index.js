import { useRouter } from 'next/router'
import React, { useEffect, useState, useCallback } from 'react'

import { Router as Router } from '../../../../nextjs-starter-kit/routes'

import NextLink from '@/components/NextLink'

function CatalogueMenu({ setOpenCatalogue, openCatalogue, menuJson, setMenuJson }) {
  const history = useRouter()

  let menuTimer
  const [menuPath, setMenuPath] = useState('0')

  const menuTreeBuilder = (menu, level = 0, parent = '0', ret = []) => {
    let sub = []

    menu.forEach((m, mi) => {
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
            route={'/' + (m.slug || '#') + '/'}
            as={'/catalog'}
            className={
              'catalogue__list-link' +
              (JSON.stringify(menuPath.split('-').slice(0, level + 2)) === JSON.stringify(`${parent}-${mi}`.split('-'))
                ? ' __active'
                : '')
            }
            //onClick={(e) => {
            //  e.preventDefault()
            //  if (e.target.classList.contains('__active')) {
            //    setOpenCatalogue(false)
            //    Router.push('/' + (m.slug || '#'))
            //  }
            //  return false
            //}}
          >
            {/*{parent}*/}
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

  return menuJson.length ? (
    <div className={'catalogue' + (openCatalogue ? ' __open' : '')}>
      <div className="catalogue__inner">{menuTreeBuilder(menuJson)}</div>
    </div>
  ) : null
}

export default CatalogueMenu
