import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Ripples from 'react-ripples'

import { setOpenProfile } from '../../../store/menus/action'

import NextLink from '@/components/NextLink'

const CabinetTabs = (props) => {
  const history = useRouter()
  const dispatch = useDispatch()
  const { asideOpen, openProfile } = useSelector((state) => state.menus)

  let { activeIndex, setActiveIndex } = props

  //const [openProfile, setOpenProfile] = useState(openProfileJotai)

  return (
    <div className="form-filter">
      <div className={`form-filter__controls`}>
        <div className="form-filter__controls_left">
          <div className="form-filter__control">
            <Ripples
              //onClick={
              //  activeIndex !== 0
              //    ? () => {
              //        setActiveIndex(0);
              //        //console.log('history', history);
              //        //history.push('/orders');
              //      }
              //    : null
              //}
              className={'btn __gray' + (activeIndex === 0 ? ' active' : '')}
              during={1000}
            >
              <NextLink to={'/orders/'} className="btn-inner">
                <span>Список заказов</span>
              </NextLink>
            </Ripples>
          </div>
          <div className="form-filter__control">
            <Ripples
              //onClick={
              //  activeIndex !== 1
              //    ? () => {
              //        setActiveIndex(1);
              //        //history.push('/bankinformation');
              //      }
              //    : null
              //}
              className={'btn __gray' + (activeIndex === 1 ? ' active' : '')}
              during={1000}
            >
              <NextLink to={'/bankinformation/'} className="btn-inner">
                <span>Реквизиты</span>
              </NextLink>
            </Ripples>
          </div>
          <div className="form-filter__control">
            <Ripples
              aria-hidden="true"
              onClick={() => {
                dispatch(setOpenProfile(true))
              }}
              className={'btn __gray'}
              during={1000}
            >
              <span className="btn-inner">
                <span>Профиль</span>
              </span>
            </Ripples>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CabinetTabs
