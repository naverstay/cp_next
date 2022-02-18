import Link from 'next/link'
import React from 'react'

/**
 * Standard way of using the Next's `Link` tag together with the `a` tag
 */
const NextLink = ({ className, children, ...rest }) => {
  const href = rest?.to || rest.route

  return (
    <Link href={href} {...rest}>
      <a href={href} className={className}>
        {children}
      </a>
    </Link>
  )
}
export default NextLink
