import React, { createRef, useEffect, useState } from 'react'
import Ripples from 'react-ripples'

import priceFormatter from '../../utils/priceFormatter'

import { findPriceIndex } from '@/utils/findPriceIndex'
import { setInputFilter } from '@/utils/inputFilter'

const CartRow = (props) => {
  const { rowIndex, tableHeader, currency, row, highlight, notificationFunc, defaultCount, updateCart } = props

  const inputRef = createRef()

  const [cartCount, setCartCount] = useState(parseFloat(row.cart))

  let priceMatch = 0 // defaultCount ? row.pricebreaks.length - 1 : -1

  console.log('row', priceMatch, row)

  useEffect(() => {
    setCartCount(parseFloat(row.cart))

    setInputFilter(inputRef.current, function (value) {
      return /^\d*$/.test(value) // Allow digits and '.' only, using a RegExp
    })

    return () => {
      inputRef.current = false
    }
  }, [])

  if (cartCount) {
    priceMatch = findPriceIndex(row.pricebreaks, cartCount)
  }

  return (
    <div
      className={`cart-results__row ${
        (rowIndex % 2 === 0 ? '__odd' : '__even') + (row.supplier === 'Louisyen' ? ' __lilu' : '')
      }`}
    >
      {Object.keys(tableHeader).map((cell, ci) =>
        cell === 'manufacturer' ? null : (
          <div key={ci} className={`cart-results__cell __${cell}`}>
            {cell === 'supplier' ? (
              <>
                <p>
                  <span className="cart-results__label __show">{tableHeader[cell]}:</span>
                  <span className="cart-results__value">{row.supplierAlias}</span>
                </p>
                <p>
                  <span className="cart-results__label __show">{tableHeader.manufacturer}:</span>
                  <span className="cart-results__value">{row.manufacturer}</span>
                </p>
              </>
            ) : (
              <>
                {cell === 'name' ? null : cell === 'quantity' ? (
                  <label className="cart-results__label" htmlFor={`cart-row-${rowIndex}`}>
                    {tableHeader[cell]}
                  </label>
                ) : (
                  <span className="cart-results__label">{tableHeader[cell]}</span>
                )}
                <span className="cart-results__value">
                  {cell === 'pricebreaks' ? (
                    <span className="cart-results__item">
                      {priceFormatter(
                        parseFloat(row.pricebreaks[priceMatch].price / currency.exChange).toFixedCustom(
                          currency.precision
                        ),
                        currency.precision
                      )}
                    </span>
                  ) : cell === 'quantity' ? (
                    <div className="cart-results__count">
                      <input
                        id={`cart-row-${rowIndex}`}
                        ref={inputRef}
                        onChange={(e) => {
                          const val = +e.target.value
                          if (val > 0) {
                            setCartCount(parseFloat(val))
                          }
                        }}
                        onBlur={(e) => {
                          const val = +e.target.value
                          if (val <= 0) {
                            e.target.value = '1'
                          }

                          if (e.target.value.length && +e.target.value < row.moq) {
                            e.target.value = `${row.moq}`
                            setCartCount(row.moq)

                            notificationFunc('success', `Для ${row.name}`, `минимальное количество: ${row.moq}`)
                          }

                          if (e.target.value.length && +e.target.value > row.quantity) {
                            e.target.value = `${row.quantity}`
                            setCartCount(row.quantity)

                            notificationFunc('success', `Для ${row.name}`, `максимальное количество: ${row.quantity}`)
                          }

                          setCartCount(parseFloat(e.target.value))

                          updateCart(row.id, +e.target.value, row.cur)
                        }}
                        defaultValue={cartCount}
                        type="text"
                        className="input"
                      />
                    </div>
                  ) : cell === 'total' ? (
                    <span className="cart-results__item">
                      {priceFormatter(
                        parseFloat((cartCount * row.pricebreaks[priceMatch].price) / currency.exChange).toFixedCustom(
                          currency.precision
                        ),
                        currency.precision
                      )}
                    </span>
                  ) : cell === 'supplier' ? (
                    row.supplierAlias
                  ) : cell === 'name' ? (
                    <>
                      <span>{row.name}</span>
                      {row.dc ? (
                        <>
                          <br />
                          <span>DC: {row.dc}</span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    row[cell] || <span data-empty={cell} />
                  )}
                </span>
              </>
            )}
          </div>
        )
      )}

      <div className="cart-results__cell __cart">
        <div className="cart-results__remove">
          <Ripples
            onClick={() => {
              updateCart(row.id, 0, {})
            }}
            during={1000}
            className="btn __blue"
          >
            <button aria-label={row.name} name={`cart-row-rm-${row.id}`} className="btn-inner">
              <span className="btn__icon icon icon-close" />
            </button>
          </Ripples>
        </div>
      </div>
    </div>
  )
}

export default CartRow
