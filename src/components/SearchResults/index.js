/**
 * SearchResults
 *
 * Lists the name and the issue count of a repository
 */

import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import Collapsible from 'react-collapsible'
import { useDispatch } from 'react-redux'

import { setTableHeadFixed } from '../../../store/search/action'
import SearchRow from '../SearchRow'

import { smoothScrollTo } from '@/utils/smoothScrollTo'

export function SearchResults(props) {
  const { bom, list, updateTime, relativeTime, currency, currencyList, notificationFunc, updateCart, devMode } = props

  const tableHead = useRef()
  const dispatch = useDispatch()

  let loaderInterval
  let listCounter = 0
  const INF_STEP = 30

  const [rowCount, setRowCount] = useState([])

  let tableHeader = {
    supplier: 'Поставщик',
    name: 'Наименование',
    manufacturer: 'Бренд',
    quantity: 'Доступно',
    price_unit: 'Кратность',
    moq: 'MIN',
    pack_quant: 'Норма уп.',
    pricebreaks: 'Цена за ед.',
    total: 'Сумма',
    delivery_period: 'Срок',
  }

  if (relativeTime) {
    tableHeader = {
      quantity: 'Доступно',
      moq: 'MIN',
      pricebreaks: 'Цена за ед.',
      total: 'Сумма',
      delivery_period: 'Срок',
    }
  }

  const tHead = (
    <div className={'search-results__row __even __head' + (relativeTime ? ' __moq-spacer' : '')}>
      {Object.keys(tableHeader).map((head, hi) => (
        <div key={hi} className={`search-results__cell __${head}`}>
          {tableHeader[head]}
        </div>
      ))}
      <div className="search-results__cell __cart">&nbsp;</div>
    </div>
  )

  console.log('tableHeader', tableHeader, tHead)

  const handleScroll = (event) => {
    if (tableHead.current && !relativeTime) {
      tableHead.current
        .closest('.main')
        .classList[tableHead.current.getBoundingClientRect().y <= 0 ? 'add' : 'remove']('__stick')
    }

    // console.log('handleScroll', list, listCounter);
  }

  useEffect(() => {
    dispatch(setTableHeadFixed(<div className="search-results__table __sticky">{tHead}</div>))

    console.log('tHead', tHead)

    document.body.addEventListener('scroll', handleScroll)

    devMode && console.log('search mount')

    if (window.innerWidth < 1200 && tableHead.current) {
      setTimeout(() => {
        smoothScrollTo(document.body, document.body.scrollTop, tableHead.current.getBoundingClientRect().top - 10, 600)
      }, 200)
    }

    return () => {
      document.body.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getMoreData = (newList, step) => {
    devMode && console.log('newList', newList)

    setRowCount((prevState) => {
      if (!newList) {
        return prevState
      }

      let newRows = newList[listCounter].data.slice(0, step * INF_STEP)

      let rowCounter = newRows.length

      devMode && console.log('prevState', prevState, rowCounter, newList, newRows)

      if (rowCounter === newList[listCounter].data.length) {
        listCounter++

        if (listCounter < newList.length) {
          rowCounter = 0
          step = 0
          newRows = newRows.concat(newList[listCounter].data.slice(rowCounter, INF_STEP))
        } else {
          clearTimeout(loaderInterval)
        }
      }

      return [...newRows]
    })

    loaderInterval = setTimeout(() => {
      getMoreData(newList, step + 1)
    }, 200)
  }

  return (
    <div className="search-results">
      <div className="search-results__table">
        <div ref={tableHead} className="search-results__head-wrapper">
          {tHead}
        </div>

        {list && list.length
          ? bom
            ? list.map((query, qi) => {
                return (
                  <Collapsible
                    key={qi}
                    open
                    transitionTime={200}
                    transitionCloseTime={200}
                    triggerTagName="div"
                    className="search-results__collapsed"
                    triggerClassName={`search-results__trigger __collapsed trigger-${qi}`}
                    triggerOpenedClassName={`search-results__trigger __expanded trigger-${qi}`}
                    openedClassName="search-results__expanded"
                    trigger={<span>{query.q}</span>}
                  >
                    {query.hasOwnProperty('data')
                      ? query.data.map((row, ri) => (
                          <SearchRow
                            key={ri}
                            updateCart={updateCart}
                            tableHeader={tableHeader}
                            defaultCount={query.c}
                            currencyList={currencyList}
                            updateTime={updateTime}
                            currency={currency}
                            highlight={query.q}
                            notificationFunc={notificationFunc}
                            row={row}
                            relativeTime={relativeTime}
                            rowIndex={ri}
                          />
                        ))
                      : null}
                  </Collapsible>
                )
              })
            : //  (
            //  rowCount.map((row, ri) => {
            //    //console.log('InfiniteScroll', ri);
            //    return <SearchRow key={ri} updateCart={updateCart} tableHeader={tableHeader} defaultCount={defaultCount} currency={currency} highlight={highlight} notificationFunc={notificationFunc} row={row} rowIndex={ri} />;
            //  })
            // )

            list[0].hasOwnProperty('data')
            ? list[0].data
                //.filter(f => f.supplier === 'Louisyen')
                .map((row, ri) => (
                  <SearchRow
                    key={ri}
                    updateCart={updateCart}
                    tableHeader={tableHeader}
                    defaultCount={list[0].c}
                    currencyList={currencyList}
                    currency={currency}
                    updateTime={updateTime}
                    highlight={list[0].q}
                    notificationFunc={notificationFunc}
                    row={row}
                    relativeTime={relativeTime}
                    rowIndex={ri}
                  />
                ))
            : null
          : null}
      </div>
    </div>
  )
}

SearchResults.propTypes = {
  list: PropTypes.array,
}

export default SearchResults
