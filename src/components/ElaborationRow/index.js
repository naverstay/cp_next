import React, { createRef, useEffect, useState } from 'react'

import FormInput from '../../components/FormInput'

import { setInputFilter } from '@/utils/inputFilter'

const ElaborationRow = (props) => {
  let { rowIndex, updateRow, row } = props

  const inputQuantityRef = createRef()

  const [justRedraw, setJustRedraw] = useState(0)
  const elaborationLabels = ['Наименование', 'Количество', 'Таргет, USD', 'Желаемая дата поставки']
  const elaborationFields = ['name', 'quantity', 'price', 'delivery_period']

  const [fields, setFields] = useState({
    'elaboration-name': row.name,
    'elaboration-quantity': row.quantity,
    'elaboration-price': row.price,
    'elaboration-delivery_period': row.delivery_period,
  })
  const [errors, setErrors] = useState({
    'elaboration-name': null,
  })

  const validate = () => {
    let obj = {}
    setErrors(errors)
    setJustRedraw(justRedraw + 1)

    elaborationFields.forEach((field) => {
      obj[field] = fields['elaboration-' + field] || ''
    })

    updateRow(rowIndex, obj)
  }

  const handleChange = (field, e) => {
    e.persist()
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'elaboration-name':
        errors[field] = e.target.value.length ? '' : 'Не может быть пустым'
        validate()
        break
      default:
        validate()
        break
    }
  }

  useEffect(() => {
    setInputFilter(inputQuantityRef.current, function (value) {
      return /^\d*$/.test(value) // Allow digits and '.' only, using a RegExp
    })

    return () => {
      inputQuantityRef.current = false
    }
  }, [])

  return (
    <div className={`elaboration-table__row${rowIndex % 2 === 0 ? ' __odd' : ' __even'}`}>
      {elaborationFields.map((f, fi) => (
        <div key={fi} className={'elaboration-table__cell __' + f}>
          <label htmlFor={'elaboration_item_' + fi} className="custom-input form-control">
            <FormInput
              id={'elaboration_item_' + fi}
              onBlur={handleChange.bind(this, 'elaboration-' + f)}
              placeholder={elaborationLabels[fi]}
              defaultValue={row.hasOwnProperty(f) ? decodeURIComponent(String(row[f])) : ''}
              name={'elaboration-' + f}
              //
              error={f === 'name' ? errors['elaboration-name'] : null}
              className="__lg"
              inputRef={f === 'quantity' ? inputQuantityRef : null}
            />
          </label>
        </div>
      ))}
    </div>
  )
}

export default ElaborationRow
