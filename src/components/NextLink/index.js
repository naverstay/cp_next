import Link from 'next/link'
import React, { FC } from 'react'

import { Link as RouterLink } from '../../routes'

/**
 * Standard way of using the Next's `Link` tag together with the `a` tag
 */
const NextLink = ({ className, children, ...rest }) => {
  const href = rest?.to || rest.route
  const link = (
    <a href={href} className={className}>
      {children}
    </a>
  )

  if (rest?.route) {
    return (
      <RouterLink route={href} {...rest}>
        {link}
      </RouterLink>
    )
  } else {
    return (
      <Link href={href} {...rest}>
        {link}
      </Link>
    )
  }
}
export default NextLink
