import React from 'react'

import NextLink from '@/components/NextLink'

function Breadcrumbs({ bread }) {
  return bread && bread.length ? (
    <div className={'breadcrumbs'}>
      <ul itemScope="" itemType="http://schema.org/BreadcrumbList" className="breadcrumbs__list">
        {bread.map((b, bi) => (
          <li itemProp="itemListElement" itemScope="" itemType="http://schema.org/ListItem" key={bi}>
            <NextLink itemProp="item" className={'breadcrumbs__link'} to={'/' + b.slug + '/'}>
              <React.Fragment>
                <span itemProp="name">{b.name}</span>
                <meta itemProp="position" content={bi + 1} />
              </React.Fragment>
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  ) : null
}

export default Breadcrumbs
