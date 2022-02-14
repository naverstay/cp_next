import React, { useEffect, useState } from 'react'

const AsideContainer = (props) => {
  let { setAsideOpen, children, className } = props

  return (
    <div className={'aside-holder ' + className}>
      <div
        aria-hidden="true"
        className="aside-overlay"
        onClick={() => {
          setAsideOpen(false)
        }}
      />
      <div className="aside-container">
        <div className="aside-close" />

        <div
          aria-hidden="true"
          onClick={() => {
            setAsideOpen(false)
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
