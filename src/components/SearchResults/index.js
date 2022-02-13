/**
 * SearchResults
 *
 * Lists the name and the issue count of a repository
 */

import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import Collapsible from 'react-collapsible'

import SearchRow from '../SearchRow'

import { tableHeadFixedJotai } from '@/store/store'
import { smoothScrollTo } from '@/utils/smoothScrollTo'

export function SearchResults(props) {
  const {
    bom,
    list,
    cart,
    updateTime,
    relativeTime,
    scrollTriggers,
    setScrollTriggers,
    currency,
    currencyList,
    highlight,
    notificationFunc,
    updateCart,
  } = props

  const [tableHeadFixed, setTableHeadFixed] = useAtom(tableHeadFixedJotai)

  const tableHead = useRef()

  let loaderInterval
  const stepCounter = 0
  let listCounter = 0
  const rowCounter = 0
  const INF_STEP = 30

  const [rowCount, setRowCount] = useState([])
  const [hasMore, setHasMore] = useState(true)

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

  const handleScroll = (event) => {
    if (tableHead.current && !relativeTime) {
      tableHead.current
        .closest('.main')
        .classList[tableHead.current.getBoundingClientRect().y <= 0 ? 'add' : 'remove']('__stick')
    }

    // console.log('handleScroll', list, listCounter);
  }

  useEffect(() => {
    setTableHeadFixed(<div className="search-results__table __sticky">{tHead}</div>)

    document.body.addEventListener('scroll', handleScroll)

    window.log && console.log('search mount')

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
    window.log && console.log('newList', newList)

    setRowCount((prevState) => {
      if (!newList) {
        return prevState
      }

      let newRows = newList[listCounter].data.slice(0, step * INF_STEP)

      let rowCounter = newRows.length

      window.log && console.log('prevState', prevState, rowCounter, newList, newRows)

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

  // useEffect(() => {
  //  clearInterval(loaderInterval);
  //
  //  if (list && list[listCounter].data.length) {
  // setRowCount(list[listCounter].data.slice(0, INF_STEP));

  // console.log('setRowCount', list);
  // getMoreData(list, 0);

  // return () => {
  //  loaderInterval = setInterval(() => {
  //
  //  }, 1000);
  // };
  //  }
  // }, [list]);

  window.log && console.log('list', list, list && list.length ? list[0].data : '0')

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
