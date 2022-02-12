/**
 *
 * ToggleOption
 *
 */

import PropTypes from 'prop-types'
import React from 'react'

const FormInput = ({
  id,
  type,
  clear,
  value,
  defaultValue,
  disabled,
  error,
  onChange,
  onBlur,
  inputRef,
  placeholder,
  name,
  textarea,
  className,
}) => {
  let inputValueProps = {}

  if (value !== null) {
    inputValueProps.value = value
  } else if (defaultValue !== null) {
    inputValueProps.defaultValue = defaultValue
  }

  return (
    <div className={`custom-input form-control${textarea ? ' __ta' : ''}`}>
      {typeof clear === 'function' && !disabled ? (
        <button
          className="form-control__clear icon icon-close"
          onClick={() => {
            clear()
          }}
        />
      ) : null}

      {textarea ? (
        <textarea
          //
          onChange={onChange || null}
          onBlur={onBlur || null}
          ref={inputRef || null}
          name={name || null}
          placeholder={placeholder || null}
          className={`input ${className || ''}${
            disabled ? '' : error === null ? '' : error ? ' __error' : ' __success'
          }`}
          disabled={disabled || null}
          id={id}
          {...inputValueProps}
        />
      ) : (
        <input
          //
          onChange={onChange || null}
          onBlur={onBlur || null}
          ref={inputRef || null}
          name={name || null}
          placeholder={placeholder || null}
          className={`input ${className || ''}${
            disabled ? '' : error === null ? '' : error ? ' __error' : ' __success'
          }`}
          disabled={disabled || null}
          type={type}
          id={id}
          {...inputValueProps}
        />
      )}
    </div>
  )
}

FormInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  error: PropTypes.any,
  textarea: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
}

export default FormInput
