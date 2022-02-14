import React, { createRef, useEffect, useState } from 'react'
import Ripples from 'react-ripples'

import dateFormatter from '../../utils/dateFormatter'
import priceFormatter from '../../utils/priceFormatter'

const OrderRow = (props) => {
  const { rowIndex, tableHeader, rowClick, row, updateCart, notificationFunc } = props

  const healthGradient = (percent) => {
    const start = Math.min(96, Math.max(0, percent - 2))

    return (
      <span
        style={{
          backgroundImage: `linear-gradient(to right, rgb(190, 243, 49) ${start}%, rgb(220, 247, 150) ${
            start + 4
          }%,  rgb(250, 250, 250) 100%)`,
        }}
        className="orders-health__bar"
      >
        <span>{percent}%</span>
      </span>
    )
  }

  const buildChronology = (row) => {
    // let products = row.products.map((p, pi) => {
    //  return <li className={pi % 2 === 0 ? ' __odd' : ' __even'} />;
    // });

    return (
      <div className="orders-chronology__scroller">
        {row.chronology && row.chronology.length ? (
          <ul className="orders-chronology__list">
            {row.chronology.reverse().map((c, ci) => (
              <li key={ci} className={ci % 2 ? '__even' : '__odd'}>
                {c.datetime ? <span className="orders-chronology__date">{dateFormatter(c.datetime)}</span> : null}
                <span>{c.name}</span>
                {c.file ? (
                  <a className="orders-chronology__link __green" href={c.file}>
                    xlsx
                  </a>
                ) : null}
              </li>
            ))}
            {/*<li className="__odd">
            <span>25.05.2021 — отгружено 20%</span>
            <a className="orders-chronology__link __green" href="#">
              упд xlsx
            </a>
          </li>
          <li className="__even">
            <span>25.05.2021 — на складе 10%</span>
          </li>
          <li className="__odd">
            <span>07.06.2021 — товар заказан</span>
          </li>
          <li className="__even">
            <span>26.05.2021 — оплачено 30%</span>
          </li>
          <li className="__odd">
            <span>25.05.2021 — отгружено 20%</span>
            <a className="orders-chronology__link __green" href="#">
              упд xlsx
            </a>
          </li>
          <li className="__even">
            <span>25.05.2021 — на складе 10%</span>
          </li>
          <li className="__odd">
            <span>07.06.2021 — товар заказан</span>
          </li>
          <li className="__even">
            <span>26.05.2021 — оплачено 30%</span>
          </li>
          <li className="__odd">
            <span>07.06.2021 — товар заказан</span>
          </li>
          <li className="__even">
            <span>26.05.2021 — оплачено 30%</span>
          </li>
          <li className="__odd">
            <span>25.05.2021 — отгружено 20%</span>
            <a className="orders-chronology__link __green" href="#">
              упд xlsx
            </a>
          </li>
          <li className="__even">
            <span>25.05.2021 — на складе 10%</span>
          </li>
          <li className="__odd">
            <span>07.06.2021 — товар заказан</span>
          </li>
          <li className="__even">
            <span>26.05.2021 — оплачено 30%</span>
          </li>
          <li className="__odd">
            <span>25.05.2021 — счёт выставлен</span>
            <a className="orders-chronology__link __green" href="#">
              xlsx
            </a>
            <a className="orders-chronology__link __red" href="#">
              pdf
            </a>
          </li>*/}
          </ul>
        ) : (
          <span data-empty={'chronology'} />
        )}
      </div>
    )
  }

  const buildStatusHealth = (row) => {
    return (
      <ul className="orders-health__list">
        <li>
          <span>Оплачено</span>
          {healthGradient(parseInt(row.statuses && row.statuses.hasOwnProperty('pay') ? row.statuses.pay : 0))}
        </li>
        <li>
          <span>На складе</span>
          {healthGradient(parseInt(row.statuses && row.statuses.hasOwnProperty('stock') ? row.statuses.stock : 0))}
        </li>
        <li>
          <span>Отгружено</span>
          {healthGradient(parseInt(row.statuses && row.statuses.hasOwnProperty('ship') ? row.statuses.ship : 0))}
        </li>
      </ul>
    )
  }

  return (
    <div
      aria-hidden="true"
      onClick={(e) => {
        if (e.target.tagName !== 'A') {
          rowClick(row)
        }
      }}
      className={`orders-results__row${rowIndex % 2 === 0 ? ' __odd' : ' __even'}`}
    >
      {Object.keys(tableHeader).map((cell, ci) => (
        <div key={ci} className={`orders-results__cell __${cell}`}>
          <span className="orders-results__label">{tableHeader[cell]}</span>
          {cell === 'requisites' ? (
            typeof row[cell] === 'string' ? (
              <span className="orders-results__value">{row[cell]}</span>
            ) : (
              <span className="orders-results__value">{`${
                row[cell].company_name ? `${row[cell].company_name}, ` : ''
              }ИНН ${row[cell].inn || <span data-empty="inn" />}`}</span>
            )
          ) : cell === 'statuses' ? (
            buildStatusHealth(row)
          ) : cell === 'chronology' ? (
            buildChronology(row)
          ) : cell === 'created_at' || cell === 'delivery_date' ? (
            <span className="orders-results__value">{dateFormatter(row[cell])}</span>
          ) : cell === 'amount' ? (
            <span className="orders-results__value">{priceFormatter(row[cell])}</span>
          ) : cell === 'left' ? (
            <span className="orders-results__value">{priceFormatter(row.amount - row.payed)}</span>
          ) : (
            <span className="orders-results__value">{row[cell] ? row[cell] : <span data-empty={cell} />}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default OrderRow
