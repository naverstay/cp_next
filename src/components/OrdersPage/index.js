/**
 * OrdersPage
 *
 * Lists the name and the issue count of a repository
 */

import React, { useEffect, useRef, useState } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { useDispatch } from 'react-redux'
import Ripples from 'react-ripples'

import { setOpenDetails, setOpenRequisites } from '../../../store/menus/action'
import { setTableHeadFixed } from '../../../store/search/action'
import FormSelect from '../../components/FormSelect'
import apiGET from '../../utils/search'
import CabinetTabs from '../CabinetTabs'
import OrderRow from '../OrderRow'
import RequisitesRow from '../RequisitesRow'

import LoadingIndicator from '@/components/LoadingIndicator'
import { smoothScrollTo } from '@/utils/smoothScrollTo'

export function OrdersPage(props) {
  const {
    devMode,
    activeTab,
    needLogin,
    count,
    notificationFunc,
    updateCart,
    //catalogData,
    //setTableHeadFixed,
    //setOpenRequisites,
    //setOpenDetails,
    currency,
  } = props

  const defaultCount = count

  const tableHead = useRef()
  const dispatch = useDispatch()

  const [ordersList, setOrdersList] = useState([])
  const [requisitesList, setRequisitesList] = useState([])
  const [requisitesFilter, setRequisitesFilter] = useState('')
  const [ordersFilter, setOrdersFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState([])
  const [statusOptions, setStatusOptions] = useState([])

  const [sortCol, setSortCol] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [openSort, setOpenSort] = useState(false)

  const sortRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenSort(false)
    },
  })

  // const statusOptions = [
  //  { value: 'Сделка', label: 'Сделка' },
  //  { value: 'Заявка', label: 'Заявка' },
  //  { value: 'Запрос отправлен', label: 'Запрос отправлен' },
  //  { value: 'Есть условия поставки частично', label: 'Есть условия поставки частично' },
  //  { value: 'Пришел ответ, надо посчитать', label: 'Пришел ответ, надо посчитать' },
  //  { value: 'Есть условия поставки', label: 'Есть условия поставки' },
  //  { value: 'Коммерческое предложение', label: 'Коммерческое предложение' },
  //  { value: 'Счет выставлен', label: 'Счет выставлен' },
  //  { value: 'Согласование заказа', label: 'Согласование заказа' },
  // ];

  const tableHeaderOrders = {
    title: 'Заказ №',
    requisites: 'Реквизиты',
    contact_name: 'Заказал',
    amount: 'Сумма',
    left: 'Остаток',
    created_at: 'Дата\nсоздания',
    delivery_date: 'Дата\nпоставки',
    statuses: ' ',
    chronology: 'Хронология',
    //
    // amount: 7377,
    // contact_name: 'Aleen Harvey',
    // created_at: '2021-07-08T15:40:06.000000Z',
    // delivery_type: 'test',
    // id: 28,
    // in_stock: 60,
    // payed: 9903,
    // unloaded: 19,
    // updated_at: '2021-07-08T15:40:06.000000Z',
  }

  const tableHeaderSort = ['title', 'requisites', 'contact_name', 'amount', 'left', 'created_at', 'delivery_date']

  const tableHeaderRequisites = {
    // address: '39846 Demetris Fords',
    // bank_name: 'Volkman-Schmitt',
    // contact_email: 'crist.baby@example.net',
    // contact_phone: '79999999999',
    // created_at: '2021-07-08T15:40:06.000000Z',
    // id: 28,
    // notes: 'test',
    // profile_id: 10,
    // updated_at: '2021-07-08T15:40:06.000000Z',
    //
    company_name: 'Компания',
    inn: 'ИНН',
    bank_account: 'Расчетный счет',
    bank_name: 'Банк',
    bic: 'БИК',
    undistributed_amount: 'Нераспределенные\nсредства',
    available: 'Доступно',
    contact_name: 'Контактное\nлицо',
  }

  const tHeadOrders = (
    <div className="orders-results__row __even __head">
      {Object.keys(tableHeaderOrders).map((head, hi) => (
        <div
          aria-hidden="true"
          onClick={() => {
            if (tableHeaderSort.indexOf(head) > -1) {
              setSortCol(head)
              setSortAsc(!sortAsc)
            }
          }}
          key={hi}
          className={`orders-results__cell __${head}${
            (tableHeaderSort.indexOf(head) > -1 ? ' __sort' : '') +
            (tableHeaderSort.indexOf(head) > -1 && head === sortCol
              ? ` icon__ icon-chevron-up__${sortAsc ? ' __asc' : ' __desc'}`
              : '')
          }`}
        >
          <span>{tableHeaderOrders[head]}</span>
        </div>
      ))}
    </div>
  )

  const tHeadRequisites = (
    <div className="requisites-results__row __even __head">
      {Object.keys(tableHeaderRequisites).map((head, hi) => (
        <div
          aria-hidden="true"
          onClick={() => {
            if (tableHeaderSort.indexOf(head) > -1) {
              setSortCol(head)
              setSortAsc(!sortAsc)
            }
          }}
          key={hi}
          className={`requisites-results__cell __${head}${
            (tableHeaderSort.indexOf(head) > -1 ? ' __sort' : '') +
            (tableHeaderSort.indexOf(head) > -1 && head === sortCol
              ? ` icon__ icon-chevron-up__${sortAsc ? ' __asc' : ' __desc'}`
              : '')
          }`}
        >
          <span>{tableHeaderRequisites[head]}</span>
        </div>
      ))}
      <div className="requisites-results__cell __rm">&nbsp;</div>
    </div>
  )

  const updateTableHeader = () => {
    dispatch(
      setTableHeadFixed(
        <div className="search-results__table __sticky">{activeTab === 0 ? tHeadOrders : tHeadRequisites}</div>
      )
    )
  }

  const handleScroll = (event) => {
    if (tableHead.current) {
      tableHead.current
        .closest('.main')
        .classList[tableHead.current.getBoundingClientRect().y <= 0 ? 'add' : 'remove']('__stick')
    }

    // console.log('handleScroll', list, listCounter);
  }

  const onlyUnique = (value, index, self) => self.indexOf(value) === index

  const getOrders = () => {
    const requestURL = '/orders'

    apiGET(requestURL, {}, (data) => {
      devMode && console.log('getOrders', data)

      if (data.error) {
        needLogin()
      } else {
        const statuses = data.reduce(
          (all, d) => all.concat(d.chronology.reduce((ret, p) => ret.concat(p.name), [])),
          []
        )
        //devMode && console.log('statuses', statuses, statuses.filter(onlyUnique))

        setStatusOptions(statuses.filter(onlyUnique).map((u) => ({ value: u, label: u })))

        setOrdersList(data.reverse())
      }
    })
  }

  const getRequisites = () => {
    const requestURL = '/requisites'

    apiGET(requestURL, {}, (data) => {
      devMode && console.log('getRequisites', data)

      if (data.error) {
        needLogin()
      } else {
        setRequisitesList(data)
      }
    })
  }

  const getData = () => {
    if (activeTab === 0) {
      getOrders()
    } else {
      getRequisites()
    }
  }

  useEffect(() => {
    getData()
    updateTableHeader()
  }, [activeTab])

  useEffect(() => {
    updateTableHeader()
  }, [sortCol, sortAsc])

  useEffect(() => {
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

  const handleChangeStatus = (field, e) => {
    devMode && console.log('handleChangeStatus', field, e)

    const filter = e.target.map((f) => f.value)

    setStatusFilter(filter)
  }

  const handleChangeSort = (field, e) => {
    devMode && console.log('handleChangeSort', field, e)
  }

  return (
    <div className="orders-results">
      <CabinetTabs activeIndex={activeTab} {...props} />

      {activeTab === 0 ? (
        <>
          <div className="form-filter">
            <div className="form-filter__controls">
              <div className="form-filter__controls_left">
                <div className="form-filter__control __search">
                  <input
                    onChange={(e) => {
                      setOrdersFilter(e.target.value)
                    }}
                    // value={itemCount}
                    placeholder="Быстрый поиск"
                    type="text"
                    className="input"
                  />
                </div>

                {/*  <div ref={sortRef} className="form-filter__control __order-sort">
                  <Ripples
                    onClick={() => {
                      setOpenSort(true);
                    }}
                    className="btn __gray"
                    during={1000}
                  >
                    <span className="btn-inner">
                      <span className={'icon icon-chevron-up' + (sortAsc ? ' __asc' : ' __desc')} />
                      <span>{tableHeaderOrders[sortCol]}</span>
                    </span>
                  </Ripples>

                  {openSort && (
                    <div className="dropdown-container">
                      <ul className="dropdown-list">
                        {tableHeaderSort.map((t, ti) => (
                          <li key={ti}>
                            <Ripples
                              onClick={() => {
                                setSortCol(t);
                                setSortAsc(!sortAsc);
                                setOpenSort(false);
                              }}
                              className="dropdown-link"
                              during={1000}
                            >
                              <span>{tableHeaderOrders[t]}</span>
                            </Ripples>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
*/}
                {statusOptions.length ? (
                  <FormSelect
                    multi
                    onChange={handleChangeStatus}
                    options={statusOptions}
                    placeholder="Статус"
                    name="order-state"
                    error={null}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="orders-results__table">
            {ordersList && ordersList.length ? (
              <>
                <div ref={tableHead} className="orders-results__head-wrapper">
                  {tHeadOrders}
                </div>

                {ordersList
                  .sort((a, b) => {
                    if (!sortCol) return 0

                    let ret = a[sortCol] < b[sortCol] ? -1 : 1

                    if (sortCol === 'left') {
                      ret = a.amount - a.payed < b.amount - b.payed ? -1 : 1
                    }

                    return ret * (sortAsc ? 1 : -1)
                  })
                  .map((row, ri) => {
                    let ret = (
                      <OrderRow
                        key={ri}
                        rowClick={(e) => {
                          dispatch(setOpenDetails(e))
                        }}
                        updateCart={updateCart}
                        tableHeader={tableHeaderOrders}
                        defaultCount={defaultCount}
                        currency={currency}
                        notificationFunc={notificationFunc}
                        row={row}
                        rowIndex={ri}
                      />
                    )

                    if (ordersFilter) {
                      if (!(`${row.title}`.indexOf(ordersFilter) === 0)) {
                        ret = null
                      }
                    }

                    if (statusFilter.length) {
                      let count = 0

                      for (const chrono of row.chronology) {
                        if (statusFilter.indexOf(chrono.name) > -1) {
                          count++
                          break
                        }

                        if (count) {
                          break
                        }
                      }

                      if (!count) {
                        ret = null
                      }
                    }

                    return ret
                  })}
              </>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="form-filter">
            <div className="form-filter__controls __requisites">
              <div className="form-filter__controls_left">
                <div className="form-filter__control __search">
                  <input
                    onChange={(e) => {
                      setRequisitesFilter(e.target.value)
                    }}
                    // value={itemCount}
                    placeholder="Быстрый поиск"
                    type="text"
                    className="input"
                  />
                </div>
              </div>
              <div className="form-filter__controls_right">
                <div className="form-filter__control">
                  <Ripples
                    onClick={() => {
                      dispatch(setOpenRequisites(-1))
                    }}
                    className="btn __blue"
                    during={1000}
                  >
                    <span className="btn-inner">Добавить реквизиты</span>
                  </Ripples>
                </div>
              </div>
            </div>
          </div>

          <div className="requisites-results__table">
            {requisitesList && requisitesList.length ? (
              <>
                <div ref={tableHead} className="requisites-results__head-wrapper">
                  {tHeadRequisites}
                </div>

                {requisitesList.map((row, ri) => {
                  let ret = (
                    <RequisitesRow
                      key={ri}
                      rowClick={(e) => {
                        console.log('rowClick', e)
                        dispatch(setOpenRequisites(e))
                      }}
                      updateCart={updateCart}
                      tableHeader={tableHeaderRequisites}
                      defaultCount={defaultCount}
                      currency={currency}
                      notificationFunc={notificationFunc}
                      row={row}
                      rowIndex={ri}
                    />
                  )

                  if (requisitesFilter) {
                    if (
                      !(
                        `${row.company_name}`.toLowerCase().indexOf(requisitesFilter.toLowerCase()) === 0 ||
                        `${row.inn}`.indexOf(requisitesFilter) === 0
                      )
                    ) {
                      ret = null
                    }
                  }

                  return ret
                })}
              </>
            ) : (
              <LoadingIndicator page={'bankinformation'} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

OrdersPage.propTypes = {}

export default OrdersPage
