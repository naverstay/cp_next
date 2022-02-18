import React from 'react'

import Circle from './Circle'

import SkeletonDt from '@/components/SkeletonDt'
import SkeletonTab from '@/components/SkeletonTab'
import SkeletonWide from '@/components/SkeletonWide'

const LoadingIndicator = (props) => {
  console.log('LoadingIndicator', props.page)

  return props.page === 'search' || props.page === '' ? (
    <div className="skeleton-holder">
      <div className="skeleton skeleton-mob">
        <SkeletonWide />
      </div>
      <div className="skeleton skeleton-tab">
        <SkeletonTab />
      </div>
      <div className="skeleton skeleton-dt">
        <SkeletonDt />
      </div>
      <div className="skeleton skeleton-wide">
        <SkeletonWide />
      </div>
    </div>
  ) : (
    <div className={'catalogue-page__loader'} />
  )
}

export default LoadingIndicator
