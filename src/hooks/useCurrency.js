import { useState } from 'react'

import { RUB } from '@/store/constants'

export default function useCurrency() {
  const [currency, setSate] = useState(RUB)

  const setCurrency = (val) => setSate(val)

  return { currency, setCurrency }
}
