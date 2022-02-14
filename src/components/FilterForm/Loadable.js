/**
 * Asynchronously loads the component for FilterForm
 */

import React from 'react'

import loadable from '../../utils/loadable'
import LoadingIndicator from '../LoadingIndicator'

export default loadable(() => import('./index'), {
  fallback: <LoadingIndicator />,
})
