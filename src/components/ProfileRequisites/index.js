import React, { useEffect, useState } from 'react'
import Ripples from 'react-ripples'

import FormInput from '../../components/FormInput'
import apiPATCH from '../../utils/change'
import copyTextToClipboard from '../../utils/clipboard'
import innValidation from '../../utils/innValidation'
import apiPOST from '../../utils/upload'

import { setInputFilter } from '@/utils/inputFilter'
import { validateEmail } from '@/utils/validateEmail'

const ProfileRequisites = (props) => {
  const { requisitesId, requisites, notificationFunc, devMode } = props

  const authRef = React.createRef()
  const requisitesRef = React.createRef()
  const resetRef = React.createRef()
  const phoneInput = React.createRef()
  const commentInput = React.createRef()
  const contactInput = React.createRef()
  const emailInput = React.createRef()
  const innInput = React.createRef()
  const accountInput = React.createRef()
  const bikInput = React.createRef()
  const addressInput = React.createRef()

  const [fields, setFields] = useState({
    'requisites-inn': '',
    'requisites-account': '',
    'requisites-bik': '',
    'requisites-address': '',
    'requisites-contact': '',
    'requisites-phone': '',
    'requisites-email': '',
  })
  const [errors, setErrors] = useState({
    'requisites-inn': null,
    'requisites-account': null,
    'requisites-bik': null,
    'requisites-address': null,
    'requisites-contact': null,
    'requisites-phone': null,
    'requisites-email': null,
  })

  const [validForm, setValidForm] = useState(false)
  const [justRedraw, setJustRedraw] = useState(0)

  const requisitesSubmit = (e) => {
    e.preventDefault()
    const requestURL = '/requisites'

    const formData = new FormData()
    const options = {}

    formData.append('address', addressInput.current.value)
    formData.append('bank_account', accountInput.current.value)
    formData.append('bic', bikInput.current.value)
    formData.append('inn', innInput.current.value)
    formData.append('contact_name', contactInput.current.value)
    formData.append('contact_email', emailInput.current.value)
    formData.append('contact_phone', phoneInput.current.value)
    formData.append('notes', commentInput.current.value)

    devMode && console.log('requisitesSubmit')

    if (requisitesId) {
      // address: "274 O'Keefe Camp Apt. 171"
      // available: 69970
      // bank_account: "4817744862"
      // bank_name: "Zemlak, Turcotte and Conn"
      // bic: "40936482"
      // company_name: "Conroy, Parisian and Wintheiser"
      // contact_email: "elenor91@example.com"
      // contact_name: "Meaghan Torp"
      // contact_phone: "79999999999"
      // created_at: "2021-07-08T15:40:05.000000Z"
      // id: 13
      // inn: 77449659
      // notes: "test"
      // profile_id: 5
      // undistributed_amount: 22198
      // updated_at: "2021-07-08T15:40:05.000000Z"

      apiPATCH(`${requestURL}/${requisitesId}`, formData, options, (data) => {
        if (data.error) {
          notificationFunc('success', `Ошибка при обновлении реквизитов`, ' ')
        } else {
          notificationFunc('success', `Реквизиты обновлены`, ' ')
        }
      })
    } else {
      apiPOST(requestURL, formData, options, (data) => {
        if (data.error) {
          notificationFunc('success', `Ошибка при добавлении реквизитов`, ' ')
        } else {
          notificationFunc('success', `Реквизиты добавлены`, ' ')
        }
      })
    }

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

  const successCopy = (text) => {
    notificationFunc('success', `Реквизиты скопированы в буфер обмена`, ' ')
  }

  const failCopy = () => {
    notificationFunc('success', `Ошибка копирования в буфер обмена`, ':(')
  }

  const copyRequisites = () => {
    copyTextToClipboard(requisitesRef.current.innerText, successCopy, failCopy)
  }

  const handleChange = (field, e) => {
    devMode && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    const validate = () => {
      setErrors(errors)

      setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)

      setJustRedraw(justRedraw + 1)
    }

    switch (field) {
      case 'requisites-inn':
        if (e.target.value.length) {
          innValidation(
            e.target.value,
            (e) => {
              devMode && console.log(e.hasOwnProperty('suggestions'), e.suggestions)
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
      case 'requisites-bik':
      case 'requisites-address':
      case 'requisites-contact':
        errors[field] = e.target.value.length ? '' : 'Не может быть пустым'
        validate()
        break
      case 'requisites-account':
        errors[field] = e.target.value.length >= 8 ? '' : 'Минимум 8 символов'
        validate()
        break
      case 'requisites-phone':
        errors[field] = e.target.value.length >= 8 ? '' : 'Минимум 8 символов'
        validate()
        break
      case 'requisites-email':
        errors[field] = e.target.value.length && validateEmail(e.target.value) ? '' : 'Проверьте формат e-mail'
        validate()
        break
    }
  }

  useEffect(() => {
    setInputFilter(phoneInput.current, function (value) {
      return /^\+?\d*$/.test(value) // Allow digits and '+' on beginning only, using a RegExp
    })

    return () => {
      phoneInput.current = false
    }
  }, [])

  devMode && console.log('requisites', requisites, requisitesId)

  return (
    <div className="profile __requisites">
      <div className="aside-title">{requisitesId ? 'Редактируем реквизиты' : 'Добавляем новые реквизиты'}</div>

      {requisitesId ? (
        <div
          aria-hidden="true"
          ref={requisitesRef}
          onClick={(e) => {
            copyRequisites()
          }}
          className="profile-info __cp"
        >
          <ul>
            <li>
              <span>Компания:&nbsp;</span> <b>{requisites.company_name}</b>
            </li>
            <li>
              <span>ИНН:&nbsp;</span> <b>{requisites.inn}</b>
            </li>
            <li>
              <span>Директор:&nbsp;</span> <b>{requisites.contact_name}</b>
            </li>
            <li>
              <span>КПП:&nbsp;</span> <b>541001001</b>
            </li>
            <li>
              <span>ОГРН:&nbsp;</span> <b>1125476094567</b>
            </li>
            <li>
              <span>р/с:&nbsp;</span> <b>40702810504000002378</b>
            </li>
            <li>
              <span>Банк:&nbsp;</span> <b>{requisites.bank_name}</b>
            </li>
            <li>
              <span>к/с:&nbsp;</span> <b>30101810100000000850</b>
            </li>
            <li>
              <span>БИК:&nbsp;</span> <b>{requisites.bic}</b>
            </li>
            <li>
              <span>Юридический адрес:&nbsp;</span> <b>{requisites.address}</b>
            </li>
            <li>
              <span>Фактический адрес:&nbsp;</span> <b>{requisites.address}</b>
            </li>
            <li>
              <span>Контактное лицо:&nbsp;</span> <b>{requisites.contact_name}</b>
            </li>
            <li>
              <span>Телефон:&nbsp;</span> <b>{requisites.contact_phone}</b>
            </li>
            <li>
              <span>Email:&nbsp;</span> <b>{requisites.contact_email}</b>
            </li>
          </ul>
        </div>
      ) : null}

      <form ref={authRef} className="form-content" onSubmit={requisitesSubmit}>
        <FormInput
          onChange={handleChange.bind(this, 'requisites-inn')}
          placeholder="ИНН"
          name="requisites-inn"
          //
          error={errors['requisites-inn']}
          className="__lg"
          inputRef={innInput}
        />

        <FormInput
          onChange={handleChange.bind(this, 'requisites-account')}
          placeholder="Расчетный счет"
          name="requisites-account"
          //
          error={errors['requisites-account']}
          className="__lg"
          inputRef={accountInput}
        />

        <FormInput
          onChange={handleChange.bind(this, 'requisites-bik')}
          placeholder="БИК"
          name="requisites-bik"
          //
          error={errors['requisites-bik']}
          className="__lg"
          inputRef={bikInput}
        />

        <FormInput
          onChange={handleChange.bind(this, 'requisites-address')}
          placeholder="Фактический адрес"
          name="requisites-address"
          //
          error={errors['requisites-address']}
          className="__lg"
          inputRef={addressInput}
        />

        <FormInput
          onChange={handleChange.bind(this, 'requisites-contact')}
          placeholder="Контактное лицо"
          name="requisites-contact"
          //
          error={errors['requisites-contact']}
          className="__lg"
          inputRef={contactInput}
        />

        <FormInput
          onChange={handleChange.bind(this, 'requisites-phone')}
          placeholder="Телефон"
          name="requisites-phone"
          //
          error={errors['requisites-phone']}
          className="__lg"
          inputRef={phoneInput}
        />

        <FormInput
          onChange={handleChange.bind(this, 'requisites-email')}
          placeholder="Ваш email"
          name="requisites-email"
          //
          error={errors['requisites-email']}
          className="__lg"
          inputRef={emailInput}
        />

        <FormInput
          textarea
          placeholder="Заметки"
          name="requisites-delivery"
          error={null}
          className="__lg"
          inputRef={commentInput}
        />

        <div className="form-control">
          <Ripples className={`__w-100p btn __blue __lg${!validForm ? ' __disabled' : ''}`} during={1000}>
            <button name="requisites-submit" className="btn-inner">
              <span>Сохранить</span>
            </button>
          </Ripples>
        </div>
      </form>
    </div>
  )
}

export default ProfileRequisites
