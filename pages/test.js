import React, { useEffect } from 'react'

import FeaturePage from '@/components/FeaturePage'

function Page({ ...props }) {
  useEffect(() => {
    console.log('test page')

    const timer = props.startClock()

    return () => {
      clearInterval(timer)
    }
  }, [props])

  return <FeaturePage {...props} />
}

export default Page
