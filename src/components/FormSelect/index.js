/**
 *
 * ToggleOption
 *
 */

import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import Select, { components } from 'react-select'

const FormSelect = ({
  id,
  preSelectedValue,
  multi,
  disabled,
  onChange,
  onBlur,
  inputRef,
  options,
  name,
  className,
  error,
  placeholder,
}) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleChange = (selectedOption) => {
    setSelectedOption({ selectedOption })
    if (inputRef && inputRef.current) {
      inputRef.current.value = selectedOption.value
    }
    onChange(name, { target: selectedOption })
  }

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
    }),
    control: () => ({
      // none of react-select's styles are passed to <Control />
      width: '100%',
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1
      const transition = 'opacity 300ms'

      return { ...provided, opacity, transition }
    },
  }

  return (
    <div className={`custom-select form-control${multi ? ' __multi' : ''}`}>
      <Select
        //
        styles={customStyles}
        classNamePrefix="select"
        // menuIsOpen={true}
        closeMenuOnSelect={!multi}
        isClearable={multi}
        isMulti={multi}
        isSearchable={false}
        hideSelectedOptions={false}
        isDisabled={disabled || null}
        placeholder={placeholder || null}
        defaultValue={options.find((o) => o.selected)}
        className={`select ${className}${error === null ? '' : error ? ' __error' : ' __success'}`}
        onChange={handleChange}
        options={options}
        components={{
          ValueContainer: ({ children, ...props }) => {
            let [values, input] = children

            if (Array.isArray(values)) {
              const val = (i) => values[i].props.children
              const { length } = values

              switch (length) {
                case 1:
                  values = `Статус: ${val(0)}`
                  break

                default:
                  values = `Статус: ${length}`
                  break
              }
            }

            return (
              <components.ValueContainer {...props}>
                {values}
                {input}
              </components.ValueContainer>
            )
          },
        }}
      />
    </div>
  )
}

FormSelect.propTypes = {
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

export default FormSelect
