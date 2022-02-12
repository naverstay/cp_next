/**
 *
 * ToggleOption
 *
 */

import PropTypes from 'prop-types'
import React, { useState } from 'react'

const FormCheck = ({
  id,
  type,
  value,
  defaultValue,
  disabled,
  error,
  onChange,
  label,
  inputRef,
  defaultChecked,
  checked,
  name,
  className,
}) => {
  const [checkState, setCheckState] = useState(defaultChecked || false)

  let checkParams = {
    value: value,
    id: id,
    name: name || null,
    disabled: disabled || null,
  }

  const checkUpdate = (e) => {
    console.log('checkUpdate', checkParams)
    if (!checkParams.hasOwnProperty('check')) {
      setCheckState(e.target.checked)
    }

    onChange({
      target: {
        value: e.target.checked,
      },
    })
  }

  if (checked === true || checked === false) {
    checkParams.checked = checked
    checkParams.className = 'css-mode'
  } else {
    checkParams.defaultChecked = checkState
  }

  return (
    <div className={`custom-input form-control`}>
      <label className={`form-check ${className || ''}${error === null ? '' : error ? ' __error' : ' __success'}`}>
        <input
          //
          type={type || 'checkbox'}
          onChange={(e) => {
            checkUpdate(e)
          }}
          ref={inputRef || null}
          {...checkParams}
        />
        <span
          className={
            'form-check__icon icon' +
            ((checked === true || checked === false ? checked : checkState) ? ' icon-check' : '')
          }
        />
        <span className={'form-check__text'}>{label || ''}</span>
      </label>
    </div>
  )
}

FormCheck.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  error: PropTypes.any,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  name: PropTypes.string,
}

export default FormCheck
