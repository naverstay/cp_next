import React, { useEffect, useState } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import Ripples from 'react-ripples'

import apiGET from '../../utils/search'
import apiPOST from '../../utils/upload'
import FormInput from '../FormInput'

import NextLink from '@/components/NextLink'
import { getJsonData } from '@/utils/getJsonData'
import { validateEmail } from '@/utils/validateEmail'

function Header({
  history,
  notificationFunc,
  openAuthPopup,
  setOpenAuthPopup,
  openMobMenu,
  openCatalogue,
  cartCount,
  profile,
  setProfile,
  setOpenMobMenu,
  setOpenCatalogue,
}) {
  const headerRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenMobMenu(false)
    },
  })

  const [fields, setFields] = useState({
    'auth-login': '',
    'auth-password': '',
  })
  const [errors, setErrors] = useState({
    'auth-login': null,
    'auth-password': null,
  })

  const [resetFields, setResetFields] = useState({
    'auth-email': '',
  })
  const [resetErrors, setResetErrors] = useState({
    'auth-email': null,
  })

  const authRef = React.createRef()
  const resetRef = React.createRef()
  const emailInput = React.createRef()
  const loginInput = React.createRef()
  const passwordInput = React.createRef()

  const [validForm, setValidForm] = useState(false)
  const [openResetPassword, setOpenResetPassword] = useState(false)

  const [justRedraw, setJustRedraw] = useState(0)
  const [validResetForm, setValidResetForm] = useState(false)

  const popupRef = useDetectClickOutside({
    onTriggered: () => {
      setOpenResetPassword(false)
      setOpenAuthPopup(false)
    },
  })

  const getUserData = () => {
    const requestURL = '/auth/me'

    apiGET(requestURL, {}, (data) => {
      const user = localStorage.getItem('catpart-user')
      let userFields = {}

      if (user) {
        userFields = getJsonData(user)
      }

      userFields['order-name'] = data.contact_name
      userFields['order-email'] = data.email
      userFields['order-phone'] = data.contact_phone

      localStorage.setItem('catpart-user', JSON.stringify(userFields))
      localStorage.setItem('catpart-profile', JSON.stringify(data))

      setProfile(data)
      history.push('/orders')
    })
  }

  const handleChange = (field, e) => {
    window.log && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'auth-login':
        errors[field] = e.target.value.length ? '' : 'Не может быть пустым'
        break
      case 'auth-password':
        errors[field] = e.target.value.length >= 8 ? '' : 'Минимум 8 символов'
        break
    }

    // localStorage.setItem('catpart-user', JSON.stringify(fields));

    setErrors(errors)

    setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)

    setJustRedraw(justRedraw + 1)
  }

  const handleResetChange = (field, e) => {
    window.log && console.log('handleResetChange', field, e)
    resetFields[field] = e.target.value
    setResetFields(resetFields)

    switch (field) {
      case 'auth-email':
        resetErrors[field] = e.target.value.length && validateEmail(e.target.value) ? '' : 'Проверьте формат e-mail'
        break
    }

    // localStorage.setItem('catpart-user', JSON.stringify(fields));

    setResetErrors(resetErrors)

    setValidResetForm(!Object.values(resetErrors).filter((er) => er === null || er.length).length)
  }

  const authSubmit = (e) => {
    e.preventDefault()

    window.log && console.log('authSubmit')

    const requestURL = '/auth/login'

    const formData = new FormData()
    const options = {}

    formData.append('email', loginInput.current.value)
    formData.append('password', passwordInput.current.value)

    apiPOST(requestURL, formData, options, (data) => {
      window.log && console.log('access_token', data)

      if (data.error) {
        notificationFunc('success', `Авторизация не удалась. `, 'Проверьте логин/пароль.')
      } else {
        localStorage.setItem('access_token', data.access_token)
        getUserData()
      }
    })

    setOpenAuthPopup(false)

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

  const resetSubmit = (e) => {
    e.preventDefault()

    window.log && console.log('resetSubmit')

    setOpenResetPassword(false)

    const requestURL = '/auth/restore'

    const formData = new FormData()
    const options = {}

    formData.append('email', emailInput.current.value)

    apiPOST(requestURL, formData, options, (data) => {
      window.log && console.log('data', data)

      if (data.error) {
        notificationFunc('success', `Письмо не отправлено. `, 'Такого аккаунта не существует.')
      } else {
        notificationFunc('success', `Письмо отправлено. `, 'Проверьте почту.')
      }
    })
  }

  // useEffect(() => {
  //  if (openAuthPopup) {
  //    handleChange('auth-login', { target: loginInput.current });
  //    handleChange('auth-password', { target: passwordInput.current });
  //  }
  // }, [openAuthPopup]);

  useEffect(() => {
    let userFields = {}
    let userEmail = ''

    console.log('history', history)

    if (loginInput?.current) {
      const user = localStorage.getItem('catpart-user')

      if (history.pathname === '/order' && user) {
        userFields = getJsonData(user)

        if (userFields.hasOwnProperty('order-email')) {
          userEmail = userFields['order-email']
          loginInput.current.value = userEmail
          handleChange('auth-login', { target: loginInput.current })
        }
      } else {
        setErrors({
          'auth-login': null,
          'auth-password': null,
        })
      }
    }
  }, [openAuthPopup])

  return (
    <header ref={headerRef} className={`header${openMobMenu ? ' __open-mob-menu' : ''}`}>
      <div className="header-left">
        <button
          onClick={() => {
            setOpenMobMenu(!openMobMenu)
          }}
          className="header-menu btn __blue"
        >
          <span />
          <span />
          <span />
        </button>
        <NextLink href="/" className="header-logo">
          catpart.ru
        </NextLink>
        <Ripples
          during={1000}
          className={'btn __blue btn-catalogue' + (openCatalogue ? ' __active' : '')}
          onClick={() => {
            setOpenCatalogue(!openCatalogue)
          }}
        >
          <span className="btn-inner">
            <span className={'catalogue-close' + (openCatalogue ? ' __open' : '')}>
              <span />
              <span />
              <span />
            </span>
            <span className="__dotted">Каталог</span>
          </span>
        </Ripples>
        <a href="tel:88005057388" className="header-phone __blue">
          <span className="btn__icon icon icon-call" />
          <span>8-800-505-73-88</span>
        </a>
      </div>
      <div className="header-navbar">
        <ul className="header-navbar__list">
          <li>
            <NextLink className="header-navbar__link" href="/about/">
              О компании
            </NextLink>
          </li>
          <li>
            <NextLink className="header-navbar__link" href="/delivery/">
              Доставка
            </NextLink>
          </li>
          <li>
            <NextLink className="header-navbar__link" href="/contacts/">
              Контакты
            </NextLink>
          </li>
        </ul>
      </div>

      <div className="header-right __auth">
        {profile?.id ? (
          <Ripples during={1000} className="btn __blue">
            {history.pathname === '/orders' ? (
              <span className="btn-inner">
                <span className="__dotted">{profile?.contact_name || 'name'}</span>
              </span>
            ) : (
              <NextLink href="/orders/" className="btn-inner">
                <span className="__dotted">{profile?.contact_name || 'name'}</span>
              </NextLink>
            )}
          </Ripples>
        ) : (
          <div ref={popupRef} className="header-popup__holder">
            <Ripples
              onClick={() => {
                setOpenAuthPopup(!openAuthPopup)
                window.log && console.log('open', openAuthPopup)
              }}
              during={1000}
              className={'btn __blue' + (openAuthPopup ? ' __active' : '')}
            >
              <span className="btn-inner">
                <span className="__dotted">Личный кабинет</span>
              </span>
            </Ripples>

            <div className={'header-popup' + (openAuthPopup || openResetPassword ? ' __show' : '')}>
              <h3 className="header-popup__title">{openResetPassword ? 'Восстановление пароля' : 'Авторизация'}</h3>
              <p>
                {openResetPassword
                  ? 'Укажите вашу электронную почту или логин для восстановления пароля'
                  : 'Введите логин и пароль для входа в систему'}
              </p>

              {openAuthPopup ? (
                <form ref={authRef} className="form-content" onSubmit={authSubmit}>
                  <FormInput
                    onChange={handleChange.bind(this, 'auth-login')}
                    placeholder="Логин"
                    name="auth-login"
                    //
                    error={errors['auth-login']}
                    className="__lg"
                    inputRef={loginInput}
                  />
                  <FormInput
                    onChange={handleChange.bind(this, 'auth-password')}
                    placeholder="Пароль"
                    name="auth-password"
                    //
                    error={errors['auth-password']}
                    // defaultValue={'12345678'}
                    className="__lg"
                    inputRef={passwordInput}
                  />

                  <div className="form-control">
                    <Ripples className={`__w-100p btn __blue __lg${!validForm ? ' __disabled' : ''}`} during={1000}>
                      <button name="auth-submit" className="btn-inner">
                        <span>Войти</span>
                      </button>
                    </Ripples>
                  </div>
                </form>
              ) : (
                <form ref={resetRef} className="form-content" onSubmit={resetSubmit}>
                  <FormInput
                    onChange={handleResetChange.bind(this, 'auth-email')}
                    placeholder="Электронная почта"
                    name="auth-email"
                    //
                    error={resetErrors['auth-email']}
                    className="__lg"
                    inputRef={emailInput}
                  />

                  <div className="form-control">
                    <Ripples
                      className={`__w-100p btn __blue __lg${!validResetForm ? ' __disabled' : ''}`}
                      during={1000}
                    >
                      <button name="auth-submit" className="btn-inner">
                        <span>Восстановить</span>
                      </button>
                    </Ripples>
                  </div>
                </form>
              )}

              <p>
                <button
                  onClick={() => {
                    setOpenResetPassword(!openResetPassword)
                    setOpenAuthPopup(!openAuthPopup)
                  }}
                  className="header-navbar__link"
                >
                  {openResetPassword ? 'Авторизоваться' : 'Забыли пароль?'}
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="header-order">
          <Ripples during={1000} className={`btn __blue${cartCount ? '' : ' __disabled'}`}>
            <NextLink href="/order/" className="btn-inner">
              <React.Fragment>
                <span className="header-order__label">Заказ</span>
                <span className="header-order__count">{cartCount || 0}</span>
              </React.Fragment>
            </NextLink>
          </Ripples>
        </div>
      </div>
    </header>
  )
}

export default Header
