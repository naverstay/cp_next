import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Ripples from 'react-ripples'

import FormInput from '../../components/FormInput'
import apiPATCH from '../../utils/change'

const Profile = (props) => {
  const { asideOpen, openProfile } = useSelector((state) => state.menus)

  let { notificationFunc, logOut, devMode, profile } = props

  const authRef = React.createRef()
  const resetRef = React.createRef()
  const emailInput = React.createRef()
  const loginInput = React.createRef()
  const passwordInput = React.createRef()

  const [fields, setFields] = useState({
    'profile-login': '',
    'profile-password': '',
  })
  const [errors, setErrors] = useState({
    'profile-password': null,
  })

  const [validForm, setValidForm] = useState(false)
  const [justRedraw, setJustRedraw] = useState(0)

  const profileSubmit = (e) => {
    e.preventDefault()

    devMode && console.log('profileSubmit')

    const requestURL = '/profiles/' + profile.id
    const password = passwordInput.current.value

    const formData = new FormData()
    const options = {}

    formData.append('password', password)

    apiPATCH(requestURL, formData, options, (data) => {
      if (data.error) {
        notificationFunc('success', `Ошибка при изменении пароля`, ' ')
      } else {
        notificationFunc('success', `Пароль успешно изменен`, ' ')
      }
    })

    //const url = '/set/deal';
    //
    //let store = localStorage.getItem('catpart');
    //
    //if (store) {
    //  store = JSON.parse(store);
    //} else {
    //  store = {};
    //}
    //
    //if (!store.hasOwnProperty('order')) {
    //  store.order = [];
    //  localStorage.setItem('catpart', JSON.stringify(store));
    //}
  }

  const handleChange = (field, e) => {
    devMode && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'profile-password':
        errors[field] = e.target.value.length >= 8 ? '' : 'Минимум 8 символов'
        break
    }

    //localStorage.setItem('catpart-user', JSON.stringify(fields));

    setErrors(errors)

    setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)

    setJustRedraw(justRedraw + 1)
  }

  useEffect(() => {
    return () => {
      setFields({
        'profile-login': '',
        'profile-password': '',
      })

      setErrors({
        'profile-password': null,
      })
    }
  }, [])

  return (
    <div className="profile">
      <div className="aside-title">Профиль</div>

      <form ref={authRef} className="form-content" onSubmit={profileSubmit}>
        <FormInput
          disabled={true}
          onChange={handleChange.bind(this, 'profile-login')}
          placeholder="Логин"
          name="profile-login"
          //
          error={null}
          defaultValue={profile.email}
          className="__lg"
          inputRef={loginInput}
        />
        <FormInput
          //type="password"
          onChange={handleChange.bind(this, 'profile-password')}
          placeholder="Пароль"
          name="profile-password"
          //
          error={errors['profile-password']}
          className="__lg"
          inputRef={passwordInput}
        />

        <div className="form-control">
          <Ripples className={`__w-100p btn __blue __lg${!validForm ? ' __disabled' : ''}`} during={1000}>
            <button name="profile-submit" className="btn-inner">
              <span>Изменить</span>
            </button>
          </Ripples>
        </div>
      </form>

      {/*      <div className="profile-info">
        <ul>
          <li>
            <span>Сумма заказов:&nbsp;</span>
            <b>423 123 812,1234 RUB</b>
          </li>
          <li>
            <span>В этом месяце:&nbsp;</span>
            <b>423 123 812,1234 RUB</b>
          </li>
          <li>
            <span>Всего счетов:&nbsp;</span>
            <b>100500</b>
          </li>
          <li>
            <span>Счета в работу:&nbsp;</span>
            <b>100500</b>
          </li>
        </ul>
      </div>*/}

      <div className="aside-caption">Ваш менеджер</div>

      <div className="profile-info">
        <ul>
          <li>{profile.responsible_name}</li>
          <li>{profile.responsible_phone}</li>
          <li>{profile.responsible_email}</li>
        </ul>
      </div>

      <div className="profile-logout">
        <div className="form-control">
          <Ripples
            onClick={() => {
              logOut()
            }}
            className={`__w-100p btn __blue __lg`}
            during={1000}
          >
            <button name="profile-submit" className="btn-inner">
              <span>Выйти</span>
            </button>
          </Ripples>
        </div>
      </div>
    </div>
  )
}

export default Profile
