import React, { createRef, useEffect, useState } from 'react'
import Ripples from 'react-ripples'

import priceFormatter from '../../utils/priceFormatter'

const RequisitesRow = (props) => {
  const { rowIndex, tableHeader, rowClick, row, updateCart, notificationFunc } = props

  return (
    <div
      aria-hidden="true"
      onClick={() => {
        rowClick(row)
      }}
      className={`requisites-results__row${rowIndex % 2 === 0 ? ' __odd' : ' __even'}`}
    >
      {Object.keys(tableHeader).map((cell, ci) => (
        <div key={ci} className={`requisites-results__cell __${cell}`}>
          <span className="requisites-results__label">{tableHeader[cell]}</span>
          {cell === 'undistributed_amount' || cell === 'available' ? (
            <span className="requisites-results__value">{priceFormatter(row[cell])}</span>
          ) : (
            <span className="requisites-results__value">{row[cell] ? row[cell] : <span data-empty={cell} />}</span>
          )}
        </div>
      ))}

      <div className="requisites-results__cell __rm">
        <div className="requisites-results__remove">
          <Ripples
            onClick={() => {
              notificationFunc('success', `Запрос на удаление`, `реквизитов: ${row.id}`)
            }}
            during={1000}
            className="btn __blue"
          >
            <button aria-label={row.name} name={`requisites-row-rm-${row.id}`} className="btn-inner">
              <span className="btn__icon icon icon-close" />
            </button>
          </Ripples>
        </div>
      </div>
    </div>
  )
}

export default RequisitesRow
