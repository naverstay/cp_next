import React, { useEffect, useState } from 'react'

const AsideContainer = (props) => {
  let { setAsideOpen, children, className } = props

  return (
    <div className={'aside-holder ' + className}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        className="aside-overlay"
        onClick={() => {
          setAsideOpen(false)
        }}
      />
      <div className="aside-container">
        <div className="aside-close" />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
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
