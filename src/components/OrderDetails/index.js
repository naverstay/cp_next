import React, { useEffect, useState } from 'react'
import Ripples from 'react-ripples'

import dateFormatter from '../../utils/dateFormatter'
import priceFormatter from '../../utils/priceFormatter'
import apiGET from '../../utils/search'
import DetailsRow from '../DetailsRow'

import { RUB } from '@/store/constants'
import { API } from '@/utils/order'
import { validateEmail } from '@/utils/validateEmail'
import { xlsDownload } from '@/utils/xlsDownload'

const OrderDetails = (props) => {
  const { detailsId, devMode, profile, order, notificationFunc } = props

  const authRef = React.createRef()
  const phoneInput = React.createRef()
  const commentInput = React.createRef()
  const contactInput = React.createRef()
  const emailInput = React.createRef()

  const [currentOrder, setCurrentOrder] = useState({})

  const [fields, setFields] = useState({
    'details-inn': '',
    'details-account': '',
    'details-bik': '',
    'details-address': '',
    'details-contact': '',
    'details-phone': '',
    'details-email': '',
  })
  const [errors, setErrors] = useState({
    'details-inn': null,
    'details-account': null,
    'details-bik': null,
    'details-address': null,
    'details-contact': null,
    'details-phone': null,
    'details-email': null,
  })

  const [validForm, setValidForm] = useState(false)
  const [justRedraw, setJustRedraw] = useState(0)

  const changeSubmit = (e) => {
    e.preventDefault()

    devMode && console.log('changeSubmit')

    // const url = '/set/deal';
    //
    // let store = localStorage.getItem('catpart');
    //
    // if (store) {
    //  store = JSON.parse(store);
    // } else {
    //  store = {};
    // }
    //
    // if (!store.hasOwnProperty('order')) {
    //  store.order = [];
    //  localStorage.setItem('catpart', JSON.stringify(store));
    // }
  }

  const handleChange = (field, e) => {
    devMode && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'details-bik':
      case 'details-inn':
      case 'details-address':
      case 'details-contact':
        errors[field] = e.target.value.length ? '' : 'Не может быть пустым'
        break
      case 'details-account':
        errors[field] = e.target.value.length >= 8 ? '' : 'Минимум 8 символов'
        break
      case 'details-phone':
        errors[field] = e.target.value.length >= 8 ? '' : 'Минимум 8 символов'
        break
      case 'details-email':
        errors[field] = e.target.value.length && validateEmail(e.target.value) ? '' : 'Проверьте формат e-mail'
        break
    }

    // localStorage.setItem('catpart-user', JSON.stringify(fields));

    setErrors(errors)

    setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)

    setJustRedraw(justRedraw + 1)
  }

  const tableHeader = {
    name: 'Компоненты',
    supplier: 'Поставщик',
    manufacturer: 'Бренд',
    quantity: 'Кол-во',
    price: 'Цена\nза шт.',
    sum: 'Сумма',
    statuses: 'Статус', // todo best times
    calculated_delivery_date: 'Расчетная дата',
    real_delivery_date: 'дата поставки',
    comment: 'Комментарий менеджера',
  }

  const tHead = (
    <div className="details-results__row __even __head">
      {Object.keys(tableHeader).map((head, hi) =>
        ['real_delivery_date', 'manufacturer', 'supplier'].indexOf(head) > -1 ? null : (
          <div key={hi} className={`details-results__cell __${head}`}>
            {head === 'statuses'
              ? null
              : head === 'calculated_delivery_date'
              ? `${tableHeader[head]}/\n${tableHeader.real_delivery_date}`
              : tableHeader[head]}
          </div>
        )
      )}
    </div>
  )

  useEffect(() => {
    // setInputFilter(phoneInput.current, function(value) {
    //  return /^\+?\d*$/.test(value); // Allow digits and '+' on beginning only, using a RegExp
    // });

    //const requestURL = `/orders/${detailsId}`
    //
    //apiGET(requestURL, {}, (data) => {
    //  devMode && console.log('OrderDetails', detailsId, data)
    //})

    return () => {
      phoneInput.current = false
    }
  }, [])

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

  return order?.id ? (
    <div className="profile __details">
      <div className="aside-title">{`${order.title || <span data-empty="title" />} от ${
        order.created_at ? dateFormatter(order.created_at) : ''
      }`}</div>

      <div className="orders-details">
        <div className="orders-details__left">
          <ul className="orders-health__list">
            <li>
              <span>Оплачено</span>
              {healthGradient(
                parseInt(order.statuses && order.statuses.hasOwnProperty('pay') ? order.statuses.pay : 0)
              )}
            </li>
            <li>
              <span>На складе</span>
              {healthGradient(
                parseInt(order.statuses && order.statuses.hasOwnProperty('stock') ? order.statuses.stock : 0)
              )}
            </li>
            <li>
              <span>Отгружено</span>
              {healthGradient(
                parseInt(order.statuses && order.statuses.hasOwnProperty('ship') ? order.statuses.ship : 0)
              )}
            </li>
          </ul>

          <ul className="orders-info">
            <li>
              <span>Заказчик:&nbsp;</span>
              <b>{`${order.requisites.company_name ? `${order.requisites.company_name}, ` : ''}ИНН ${
                order.requisites.inn || <span data-empty="inn" />
              }`}</b>
            </li>
            {/* todo best times */}
            {/*     <li>
              <span>Заказал:&nbsp;</span> <b>{order.requisites.contact_name || order.contact_name || <span data-empty="requisites" />}</b>
            </li>
            <li>
              <span>Доставка:&nbsp;</span> <b>{order.delivery_type || <span data-empty="delivery_type">еще не назначено</span>}</b>
            </li>*/}
            <li>
              <span>Адрес доставки:&nbsp;</span>{' '}
              <b>{order.requisites.address || <span data-empty="address">еще не назначен</span>}</b>
            </li>
            <li>
              <span>Получатель заказа:&nbsp;</span> <b>{order.contact_name || ''}</b>
            </li>

            {order.hasOwnProperty('documents') && order.documents.length ? (
              <li>
                <span>Документы:&nbsp;</span>
                <span>
                  {order.documents.map((d, di) => (
                    <React.Fragment key={di}>
                      {di ? <>,&nbsp;</> : null}
                      <a
                        href={`${API}/order/documents/${d.id}?token=${localStorage.getItem('access_token')}` || ''}
                        className="document-link"
                      >
                        {d.title}
                      </a>
                    </React.Fragment>
                  ))}
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="orders-details__right">
          <div className="profile-info">
            <ul>
              <li>
                <span>Сумма (RUB)&nbsp;</span>: <b>{priceFormatter(order.amount, 2)}</b>
              </li>
              {/* <li> */}
              {/*  <span>НДС (RUB)&nbsp;</span>: <b>{priceFormatter(order.amount * 0.2, 2)}</b> */}
              {/* </li> */}
              <li>
                <span>Остаток (RUB)&nbsp;</span>: <b>{priceFormatter(order.amount - order.payed, 2)}</b>
              </li>
            </ul>
          </div>

          <div className="orders-chronology__scroller">
            {order.chronology && order.chronology.length ? (
              <ul className="orders-chronology__list">
                {order.chronology.reverse().map((c, ci) => (
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

                {/* <li className={'__odd'}> */}
                {/*  <span>25.05.2021 — отгружено 20%</span> */}
                {/*  <a className={'orders-chronology__link __green'} href="#"> */}
                {/*    упд xlsx */}
                {/*  </a> */}
                {/* </li> */}
                {/* <li className={'__even'}> */}
                {/*  <span>25.05.2021 — на складе 10%</span> */}
                {/* </li> */}
                {/* <li className={'__odd'}> */}
                {/*  <span>07.06.2021 — товар заказан</span> */}
                {/* </li> */}
                {/* <li className={'__even'}> */}
                {/*  <span>26.05.2021 — оплачено 30%</span> */}
                {/* </li> */}
                {/* <li className={'__odd'}> */}
                {/*  <span>25.05.2021 — счёт выставлен</span> */}
                {/*  <a className={'orders-chronology__link __green'} href="#"> */}
                {/*    xlsx */}
                {/*  </a> */}
                {/*  <a className={'orders-chronology__link __red'} href="#"> */}
                {/*    pdf */}
                {/*  </a> */}
                {/* </li> */}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <div className="aside-order">
        <div className="form-filter__controls">
          <div className="form-filter__controls_left">
            <div className="form-filter__control">
              <Ripples
                onClick={() => {
                  if (order.products && order.products.length) {
                    xlsDownload([...order.products], RUB, 2)
                  } else {
                    notificationFunc('success', 'Корзина пуста.', 'Нечего скачивать.')
                  }
                }}
                className="btn __gray"
                during={1000}
              >
                <div className="btn-inner">
                  <span className="btn __blue">
                    <span className="btn-icon icon icon-download" />
                  </span>
                  <span>Скачать данные о заказе</span>
                </div>
              </Ripples>
            </div>
          </div>
        </div>

        <div className="search-results">
          <div className="search-results__table">
            <div className="search-results__head-wrapper">{tHead}</div>
            {order.products && order.products.length
              ? order.products.map((row, ri) => (
                  <DetailsRow
                    key={ri}
                    devMode={devMode}
                    tableHeader={tableHeader}
                    currency={RUB}
                    notificationFunc={notificationFunc}
                    row={row}
                    rowIndex={ri}
                  />
                ))
              : null}
          </div>
        </div>
      </div>

      <div className="aside-caption">Ваш менеджер</div>

      <div className="profile-info">
        <ul>
          <li>{profile.responsible_name}</li>
          <li>{profile.responsible_phone}</li>
          <li>{profile.responsible_email}</li>
        </ul>
      </div>

      {/* <div className="aside-caption __mb-18">Нужно отправить сообщение менеджеру об этом заказе?</div> */}

      {/* <form ref={authRef} className="form-content" onSubmit={changeSubmit}> */}
      {/*  <FormInput */}
      {/*    onChange={handleChange.bind(this, 'details-email')} */}
      {/*    placeholder="Ваш email" */}
      {/*    name="details-email" */}
      {/*    // */}
      {/*    error={errors['details-email']} */}
      {/*    className="__lg" */}
      {/*    inputRef={emailInput} */}
      {/*  /> */}

      {/*  <FormInput */}
      {/*    onChange={handleChange.bind(this, 'details-contact')} */}
      {/*    placeholder="ФИО" */}
      {/*    name="details-contact" */}
      {/*    // */}
      {/*    error={errors['details-contact']} */}
      {/*    className="__lg" */}
      {/*    inputRef={contactInput} */}
      {/*  /> */}

      {/*  <FormInput */}
      {/*    onChange={handleChange.bind(this, 'details-phone')} */}
      {/*    placeholder="Телефон" */}
      {/*    name="details-phone" */}
      {/*    // */}
      {/*    error={errors['details-phone']} */}
      {/*    className="__lg" */}
      {/*    inputRef={phoneInput} */}
      {/*  /> */}

      {/*  <FormInput textarea placeholder="Ваш вопрос, пожелание или другое сообщение менеджеру" name="details-delivery" error={null} className="__lg" inputRef={commentInput} /> */}

      {/*  <div className="form-control"> */}
      {/*    <Ripples className={`__w-100p btn __blue __lg${!validForm ? ' __disabled' : ''}`} during={1000}> */}
      {/*      <button name="details-submit" className="btn-inner"> */}
      {/*        <span>Отправить</span> */}
      {/*      </button> */}
      {/*    </Ripples> */}
      {/*  </div> */}
      {/* </form> */}
    </div>
  ) : null
}
export default OrderDetails
