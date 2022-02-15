/*
 * OrderForm
 *
 */

import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import React, { useEffect, memo, useState } from 'react'
import Ripples from 'react-ripples'
import { SlideDown } from 'react-slidedown'

import FormCheck from '../../components/FormCheck'
import FormInput from '../../components/FormInput'
import FormSelect from '../../components/FormSelect'
import checkEmailExist from '../../utils/checkEmailExist'
import dateFormatter from '../../utils/dateFormatter'
import innValidation from '../../utils/innValidation'
import apiORDER, { apiORDERDB } from '../../utils/order'
import priceFormatter from '../../utils/priceFormatter'

import { counterEffect } from '@/utils/counterEffect'
import { findPriceIndex } from '@/utils/findPriceIndex'
import { getJsonData } from '@/utils/getJsonData'
import { setInputFilter } from '@/utils/inputFilter'
import { validateEmail } from '@/utils/validateEmail'

export function OrderForm({
  elaboration,
  delivery,
  updateCart,
  profile,
  setOpenAuthPopup,
  notificationFunc,
  currency,
  totalCart,
  setBusyOrder,
  setOrderSent,
  devMode,
}) {
  const history = useRouter()

  const emailInput = React.createRef()
  const nameInput = React.createRef()
  const innInput = React.createRef()
  const commentInput = React.createRef()
  const deliveryInput = React.createRef()
  const phoneInput = React.createRef()
  const totalPriceRef = React.createRef()
  const agreementCheck = React.createRef()
  const [fields, setFields] = useState({
    'order-email': '',
    'order-name': '',
    'order-phone': '',
    'order-inn': '',
    'order-delivery': '',
    'order-agreement': false,
  })
  const [justRedraw, setJustRedraw] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [errors, setErrors] = useState({
    'order-email': null,
    'order-name': null,
    'order-phone': null,
    'order-inn': null,
    'order-delivery': null,
    'order-agreement': null,
  })

  const [busy, setBusy] = useState(false)
  const [validForm, setValidForm] = useState(false)
  const [deliveryOptions, setDeliveryOptions] = useState([])
  const [preSelectedDelivery, setPreSelectedDelivery] = useState(-1)

  const formRef = React.createRef()

  const handleClear = (field) => {
    devMode && console.log('handleClear', field)
    fields[field] = ''
  }

  let emailExists = false

  const validate = () => {
    const user = localStorage.getItem('catpart-user')
    let userFields = {}

    if (user) {
      userFields = getJsonData(user)
    }

    localStorage.setItem('catpart-user', JSON.stringify(Object.assign(userFields, fields)))

    setErrors(errors)

    setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)

    setJustRedraw(justRedraw + 1)

    if (emailExists) {
      setOpenAuthPopup(true)
      notificationFunc(
        'success',
        'Пользователь существует.',
        'Авторизуйтесь для оформления заказа или измените контактные данные.'
      )
    }
  }

  const handleChange = (field, e) => {
    let realEmail = ''
    devMode && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'order-inn':
        if (e.target.value.length) {
          innValidation(
            e.target.value,
            (e) => {
              devMode && console.log(fields[field], 'inn', e.hasOwnProperty('suggestions'), e.suggestions)
              errors[field] = e.hasOwnProperty('suggestions') && e.suggestions.length ? '' : 'Проверьте ИНН'
              validate()
            },
            (e) => {
              errors[field] = 'Проверьте ИНН'
              validate()
            }
          )
        } else {
          errors[field] = 'Не может быть пустым'
          validate()
        }
        break
      case 'order-agreement':
        errors[field] = fields[field] ? '' : 'Нужно принять условия'
        validate()
        break
      case 'order-name':
        errors[field] = profile.hasOwnProperty('email') || fields[field].length ? '' : 'Не может быть пустым'
        validate()
        break
      case 'order-delivery':
        errors[field] = fields[field].length ? '' : 'Не может быть пустым'
        validate()
        break
      case 'order-phone':
        errors[field] = profile.hasOwnProperty('email') || fields[field].length >= 8 ? '' : 'Минимум 8 символов'
        validate()
        break
      case 'order-email':
        realEmail = fields[field].length && validateEmail(fields[field])
        errors[field] = realEmail ? '' : 'Проверьте формат e-mail'

        if (profile.hasOwnProperty('email') || !realEmail) {
          validate()
        } else {
          checkEmailExist(
            fields[field],
            (e) => {
              devMode && console.log(fields[field], 'exists', e.hasOwnProperty('exists'), e.exists)
              emailExists = e.hasOwnProperty('exists') && e.exists

              errors[field] = emailExists ? 'Пользователь существует.' : ''
              validate()
            },
            (e) => {
              errors[field] = 'Проверьте email'
              validate()
            }
          )
        }
        break
    }
  }

  const contactSubmit = (e) => {
    e.preventDefault()

    // const url = '/set/deal';
    const url = '/orders'

    let store = localStorage.getItem('catpart')

    if (store) {
      store = getJsonData(store)
    } else {
      store = {}
    }

    setBusy(true)
    setBusyOrder(true)

    //if (!store.hasOwnProperty('order')) {
    //  store.order = [];
    //  localStorage.setItem('catpart', JSON.stringify(store));
    //}

    let ymproducts = []

    const products = store.map((s) => {
      const priceIndex = findPriceIndex(s.pricebreaks, s.cart)
      const price = priceFormatter(
        parseFloat(s.pricebreaks[priceIndex].price).toFixedCustom(currency.precision),
        currency.precision
      )

      ymproducts.push({
        id: s.id,
        name: s.name,
        quantity: s.cart,
        category: s.supplier,
        brand: s.manufacturer,
        price,
      })

      return {
        name: s.name,
        delivery_period: s.delivery_period,
        supplier: s.supplier,
        manufacturer: s.manufacturer,
        pack_quant: s.pack_quant,
        quantity: s.cart,
        price,
      }

      // return {
      //  partNo: s.name,
      //  supllier: s.manufacturer,
      //  manufacturer: s.brand,
      //  packingRate: s.pack_quant,
      //  amount: s.cart,
      //  pureprice,
      //  price,
      //  priceSumm: `${priceFormatter(s.cart * (price / currency.exChange), currency.precision)} RUB на ${dateFormatter(now, true)}`,
      //  deliveryTime: s.delivery_period,
      // };
    })

    if (elaboration && elaboration.length) {
      let orderDB = {
        inn: parseInt(fields['order-inn']),
        contact_name: fields['order-name'],
        contact_email: fields['order-email'],
        contact_phone: fields['order-phone'],
        delivery_type: fields['order-delivery'],
        comment: commentInput.current.value || '',
        amount: (totalCart / currency.exChange).toFixedCustom(2),
        products: elaboration,
        explore: true,
      }

      if (elaboration && elaboration.length) {
        ymproducts = elaboration
      }

      apiORDERDB(url, orderDB, {}, (respData) => {
        devMode && console.log('respData', respData)
        if (respData && respData.hasOwnProperty('status') && respData.status === 200) {
          if (typeof ym === 'function') {
            ym(81774553, 'reachGoal', 'senttheorder')
          }

          window.gTag({
            event: 'order',
            ecommerce: {
              currencyCode: 'RUB',
              purchase: {
                actionField: {
                  id: `gtm_${new Date().getTime()}`,
                },
                // amount: (totalCart / currency.exChange).toFixedCustom(2),
                products: ymproducts,
              },
            },
          })

          notificationFunc('success', 'Запрос на проработку отправлен!', 'И уже обрабатывается ;)')
          history.push('/')
        } else {
          notificationFunc('success', 'Ошибка обработки запроса.', 'Повторите позже.')
        }

        setBusy(false)
        setBusyOrder(false)
      })
    } else if (products.length) {
      let orderDB = {
        inn: parseInt(fields['order-inn']),
        contact_name: fields['order-name'],
        contact_email: fields['order-email'],
        contact_phone: fields['order-phone'],
        delivery_type: fields['order-delivery'],
        comment: commentInput.current.value || '',
        amount: (totalCart / currency.exChange).toFixedCustom(2),
        products,
      }

      // apiORDER(url, order, {}, respData => {
      //  if (respData && respData.hasOwnProperty('status') && respData.status === 'ok') {
      //    setOrderSent(true);
      //    ym && ym(81774553, 'reachGoal', 'senttheorder');
      //    notificationFunc('success', 'Заказ доставлен!', 'И уже обрабатывается ;)');
      //    updateCart(null, 0, {}, true);
      //  } else {
      //    notificationFunc('success', 'Ошибка обработки заказа.', 'Повторите позже.');
      //  }
      // });

      apiORDERDB(url, orderDB, {}, (respData) => {
        devMode && console.log('respData', respData)
        if (respData && respData.hasOwnProperty('status') && respData.status === 200) {
          if (typeof ym === 'function') {
            ym(81774553, 'reachGoal', 'senttheorder')
          }

          window.gTag({
            event: 'order',
            ecommerce: {
              currencyCode: 'RUB',
              purchase: {
                actionField: {
                  id: `gtm_${new Date().getTime()}`,
                },
                // amount: (totalCart / currency.exChange).toFixedCustom(2),
                products: ymproducts,
              },
            },
          })

          notificationFunc('success', 'Заказ доставлен!', 'И уже обрабатывается ;)')
          setOrderSent(true)
          updateCart(null, 0, {}, true)
        } else {
          notificationFunc('success', 'Ошибка обработки заказа.', 'Повторите позже.')
        }

        setBusy(false)
        setBusyOrder(false)
      })
    } else {
      notificationFunc('success', 'В заказе нет товаров.', `Заказ не отправлен.`)
      setBusy(false)
      setBusyOrder(false)
    }
  }

  useEffect(() => {
    if (delivery) {
      counterEffect(totalPriceRef.current, totalPrice, totalCart / currency.exChange, 800, currency.precision)
      setTotalPrice(totalCart / currency.exChange)
    }
  }, [totalCart, currency])

  useEffect(() => {
    if (elaboration && elaboration.length) {
      delete errors['order-agreement']
      delete fields['order-agreement']
      errors['order-elaboration'] =
        elaboration.filter((el) => el.name.length).length === elaboration.length ? '' : 'Пропущено название'
    } else {
      delete errors['order-elaboration']
      errors['order-agreement'] = null
      fields['order-agreement'] = false
    }
    setFields(fields)
    setErrors(errors)
    validate()
  }, [elaboration])

  useEffect(() => {
    // todo fix check
    if (!elaboration?.length && !totalCart) {
      console.log('totalCart', elaboration, totalCart)
      //history.push('/')
    }
  }, [totalCart])

  useEffect(() => {
    setInputFilter(phoneInput.current, function (value) {
      return /^\+?\d*$/.test(value) // Allow digits and '+' on beginning only, using a RegExp
    })

    const deliveryList = [
      {
        value: 'Самовывоз со склада в Новосибирске',
        label: 'Самовывоз со склада в Новосибирске',
      },
      { value: 'Доставка курьерской службой', label: 'Доставка курьерской службой' },
    ]

    const user = localStorage.getItem('catpart-user')

    if (elaboration && elaboration.length) {
      delete errors['order-agreement']
      delete fields['order-agreement']
      errors['order-elaboration'] =
        elaboration.filter((el) => el.name.length).length === elaboration.length ? '' : 'Пропущено название'
      setFields(fields)
      setErrors(errors)
      validate()
    }

    if (user) {
      const userFields = getJsonData(user)
      setFields(userFields)

      if (profile.hasOwnProperty('email') && profile.email) {
        userFields['order-name'] = profile.contact_name
        userFields['order-email'] = profile.email
        userFields['order-phone'] = profile.contact_phone
      }

      if (userFields['order-email']) {
        emailInput.current.value = userFields['order-email']
        handleChange('order-email', { target: emailInput.current })
      }

      if (userFields['order-name']) {
        nameInput.current.value = userFields['order-name']
        handleChange('order-name', { target: nameInput.current })
      }

      if (userFields['order-phone']) {
        phoneInput.current.value = userFields['order-phone']
        handleChange('order-phone', { target: phoneInput.current })
      }

      if (userFields['order-inn']) {
        innInput.current.value = userFields['order-inn']
        handleChange('order-inn', { target: innInput.current })
      }

      if (userFields['order-delivery']) {
        deliveryInput.current.value = userFields['order-delivery']
        handleChange('order-delivery', { target: deliveryInput.current })

        setPreSelectedDelivery(deliveryList.findIndex((d) => d.value === userFields['order-delivery']))

        deliveryList.forEach((d) => {
          if (d.value === userFields['order-delivery']) {
            d.selected = true
          }
        })
      }
    }

    setDeliveryOptions([...deliveryList])

    return () => {
      phoneInput.current = false
    }
  }, [])

  return (
    <div className={`form-order${delivery ? ' __delivery' : ''}`}>
      <form ref={formRef} className="form-content" onSubmit={contactSubmit}>
        {delivery && (
          <>
            {/* <div className="form-order__text">Максимальный срок доставки:</div> */}
            {/* <div className="form-order__text">3-4 недели</div> */}
            <div className="form-order__text">Итого:</div>
            <div className="form-order__text">
              <span ref={totalPriceRef} className="form-order__price" /> {currency.name}
            </div>
          </>
        )}

        <FormInput
          clear={
            fields['order-email'].length
              ? () => {
                  emailInput.current.value = ''
                  handleChange('order-email', { target: emailInput.current })
                  // handleClear('order-email');
                }
              : null
          }
          onBlur={handleChange.bind(this, 'order-email')}
          placeholder="Ваш email"
          name="order-email"
          disabled={profile.hasOwnProperty('email')}
          //
          error={errors['order-email']}
          className="__lg"
          inputRef={emailInput}
        />

        <FormInput
          clear={
            fields['order-name'].length
              ? () => {
                  nameInput.current.value = ''
                  handleChange('order-name', { target: nameInput.current })
                  // handleClear('order-name');
                }
              : null
          }
          onBlur={handleChange.bind(this, 'order-name')}
          placeholder="ФИО"
          name="order-name"
          disabled={profile.hasOwnProperty('email')}
          //
          error={errors['order-name']}
          className="__lg"
          inputRef={nameInput}
        />

        <FormInput
          clear={
            fields['order-phone'].length
              ? () => {
                  phoneInput.current.value = ''
                  handleChange('order-phone', { target: phoneInput.current })
                  // handleClear('order-phone');
                }
              : null
          }
          onBlur={handleChange.bind(this, 'order-phone')}
          placeholder="Телефон"
          name="order-phone"
          disabled={profile.hasOwnProperty('email')}
          //
          error={errors['order-phone']}
          className="__lg"
          inputRef={phoneInput}
        />

        <FormInput
          clear={
            fields['order-inn'].length
              ? () => {
                  innInput.current.value = ''
                  handleChange('order-inn', { target: innInput.current })
                  // handleClear('order-inn');
                }
              : null
          }
          onBlur={handleChange.bind(this, 'order-inn')}
          placeholder="ИНН"
          name="order-inn"
          //
          error={errors['order-inn']}
          className="__lg"
          inputRef={innInput}
        />

        {/* <FormInput clear=true */}
        {/*  onBlur={handleChange.bind(this, 'order-delivery')} */}
        {/*  placeholder={'Доставка'} */}
        {/*  name="order-delivery" */}
        {/*  // */}
        {/*  error={errors['order-delivery']} */}
        {/*  className={'__lg'} */}
        {/*  inputRef={deliveryInput} */}
        {/* /> */}

        <input
          //
          className="hide"
          ref={deliveryInput || null}
        />

        {deliveryOptions.length ? (
          <FormSelect
            //
            onChange={handleChange}
            options={deliveryOptions}
            placeholder="Доставка"
            name="order-delivery"
            error={errors['order-delivery']}
            preSelectedValue={preSelectedDelivery}
            className="__lg"
            inputRef={deliveryInput}
          />
        ) : null}

        <FormInput
          clear
          textarea
          placeholder="Комментарий"
          name="order-comment"
          error={null}
          className="__lg"
          inputRef={commentInput}
        />

        {delivery && (
          <>
            <SlideDown>
              {totalCart > 20000 ? (
                <p className={'form-free_shipping'}>
                  Сумма вашего заказа больше 20&nbsp;000 рублей. Для вас доставка за наш счёт.
                </p>
              ) : null}
            </SlideDown>

            <FormCheck
              onChange={handleChange.bind(this, 'order-agreement')}
              defaultChecked={false}
              //
              name="order-agreement"
              value="order-agreement"
              error={errors['order-agreement']}
              label="Подтверждаю ознакомление с указанными в заказе сроками"
              inputRef={agreementCheck}
            />
          </>
        )}

        <div className="form-control">
          <Ripples
            className={`__w-100p btn __blue __lg${validForm ? '' : ' __disabled'}${busy ? ' __loader' : ''}`}
            during={1000}
          >
            <button name="order-submit" className="btn-inner">
              <span>Оформить заказ</span>
            </button>
          </Ripples>
        </div>
      </form>
    </div>
  )
}

OrderForm.propTypes = {
  busy: PropTypes.bool,
  delivery: PropTypes.bool,
  elaboration: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  notificationFunc: PropTypes.func,
  onSubmitSearchForm: PropTypes.func,
  artNumber: PropTypes.string,
  onChangeUsername: PropTypes.func,
}

export default memo(OrderForm)
