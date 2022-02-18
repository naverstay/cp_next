/**
 * Cart
 *
 * Lists the name and the issue count of a repository
 */

import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { setTableHeadFixed } from '../../../store/search/action'
import CartRow from '../CartRow'

import { smoothScrollTo } from '@/utils/smoothScrollTo'

export function CartResults(props) {
  let { currency, updateCart, notificationFunc, list } = props

  const tableHead = useRef()
  const dispatch = useDispatch()

  //useEffect(() => {
  //  let store = localStorage.getItem('catpart')
  //  if (store) {
  //    setList([...getJsonData(store)])
  //  }
  //}, [])

  let tableHeader = {
    name: 'Компонент',
    supplier: 'Поставщик',
    manufacturer: 'Бренд',
    pack_quant: 'Норма уп.',
    quantity: 'Количество',
    pricebreaks: 'Цена за ед.',
    total: 'Сумма',
    delivery_period: 'Срок',
  }

  let tHead = (
    <div className="cart-results__row __even __head">
      {Object.keys(tableHeader).map((head, hi) =>
        head === 'manufacturer' ? null : (
          <div key={hi} className={`cart-results__cell __${head}`}>
            {head === 'supplier' ? <>&nbsp;</> : tableHeader[head]}
          </div>
        )
      )}
      <div className="cart-results__cell __cart">&nbsp;</div>
    </div>
  )

  const handleScroll = (event) => {
    if (tableHead.current) {
      tableHead.current
        .closest('.main')
        .classList[tableHead.current.getBoundingClientRect().y <= 0 ? 'add' : 'remove']('__stick')
    }
  }

  useEffect(() => {
    dispatch(setTableHeadFixed(<div className={'search-results__table __sticky __cart'}>{tHead}</div>))

    document.body.addEventListener('scroll', handleScroll)

    if (window.innerWidth < 1200 && tableHead.current) {
      setTimeout(() => {
        smoothScrollTo(document.body, document.body.scrollTop, tableHead.current.getBoundingClientRect().top - 10, 600)
      }, 200)
    }

    return () => {
      document.body.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Render the content into a list item
  return (
    <div className="cart-results">
      <div className={'cart-results__table'}>
        <div ref={tableHead} className={'search-results__head-wrapper'}>
          {tHead}
        </div>

        {list && list.length
          ? list.map((row, ri) => (
              <CartRow
                key={ri}
                notificationFunc={notificationFunc}
                updateCart={updateCart}
                tableHeader={tableHeader}
                currency={currency}
                row={row}
                rowIndex={ri}
              />
            ))
          : null}
      </div>
    </div>
  )
}

CartResults.propTypes = {
  list: PropTypes.array,
}

export default CartResults
