import React, { useEffect, useMemo, useRef, useState } from 'react'
import Ripples from 'react-ripples'

import FormInput from '../../components/FormInput'

import { validateEmail } from '@/utils/validateEmail'

const SupplyNotification = (props) => {
  const { devMode, notificationFunc } = props
  const emailInput = React.createRef()
  const [errors, setErrors] = useState({
    'supply-email': null,
  })

  const [fields, setFields] = useState({
    'supply-email': '',
  })

  const [busy, setBusy] = useState(false)
  const [validForm, setValidForm] = useState(false)

  const contactSubmit = (e) => {
    e.preventDefault()

    notificationFunc('success', 'Тут будет отправка', `заявки на уведомление.`)
  }

  const validate = () => {
    setErrors(errors)
    setValidForm(!Object.values(errors).filter((er) => er === null || er.length).length)
  }

  const handleChange = (field, e) => {
    devMode && console.log('handleChange', field, e)
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'supply-email':
        errors[field] = fields[field].length && validateEmail(fields[field]) ? '' : 'Проверьте формат e-mail'
        validate()
        break
    }
  }

  return (
    <div className={'form-supply'}>
      <div className={'form-supply__caption'}>Товара нет в наличии</div>

      <form action="#" onSubmit={contactSubmit}>
        <div className="form-supply__control">
          <FormInput
            clear={
              fields['supply-email'].length
                ? () => {
                    emailInput.current.value = ''
                    handleChange('supply-email', { target: emailInput.current })
                    // handleClear('supply-email');
                  }
                : null
            }
            onBlur={handleChange.bind(this, 'supply-email')}
            placeholder="Email"
            name="supply-email"
            //
            error={errors['supply-email']}
            className=""
            inputRef={emailInput}
          />
          <div className="form-control">
            <Ripples
              className={`__w-100p btn __blue${validForm ? '' : ' __disabled'}${busy ? ' __loader' : ''}`}
              during={1000}
            >
              <button name="order-submit" className="btn-inner">
                <span>Уведомить о поступлении</span>
              </button>
            </Ripples>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SupplyNotification
