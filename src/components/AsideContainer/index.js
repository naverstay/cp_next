import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { setAsideOpen } from '../../../store/menus/action'

const AsideContainer = (props) => {
  const dispatch = useDispatch()

  let { children, className } = props

  return (
    <div className={'aside-holder' + className}>
      <div
        aria-hidden="true"
        className="aside-overlay"
        onClick={() => {
          dispatch(setAsideOpen(false))
        }}
      />
      <div className="aside-container">
        <div className="aside-close" />

        <div
          aria-hidden="true"
          onClick={() => {
            dispatch(setAsideOpen(false))
          }}
          className="aside-close btn __blue"
        >
          <span />
          <span />
          <span />
        </div>
        <div className="aside-inner">{children}</div>
      </div>
    </div>
  )
}

export default AsideContainer
