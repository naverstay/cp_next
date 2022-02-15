import { useRouter } from 'next/router'
import React, { useEffect, useState, useCallback } from 'react'

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
          <span
            aria-hidden="true"
            className={
              'catalogue__list-link' +
              (JSON.stringify(menuPath.split('-').slice(0, level + 2)) === JSON.stringify(`${parent}-${mi}`.split('-'))
                ? ' __active'
                : '')
            }
            onClick={(e) => {
              if (e.target.classList.contains('__active')) {
                setOpenCatalogue(false)
                history.push('/' + (m.slug || '#'))
              }
              return false
            }}
          >
            {/*{parent}*/}
            {m.name}
          </span>
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
