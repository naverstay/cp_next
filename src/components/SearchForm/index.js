/*
 * SearchForm
 *
 */

import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import React, { useEffect, memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Ripples from 'react-ripples'

import { setFormBusy } from '../../../store/search/action'
import FormInput from '../../components/FormInput'
import apiPOST from '../../utils/upload'

import { setInputFilter } from '@/utils/inputFilter'

export function SearchForm({
  notificationFunc,
  onSubmitSearchForm,
  setSearchData,
  //, formBusy, setFormBusy
}) {
  const history = useRouter()
  const dispatch = useDispatch()

  const { formBusy } = useSelector((state) => state.search)

  const formRef = React.createRef()
  const formArtNumber = React.createRef()
  const formQuantity = React.createRef()
  const formFile = React.createRef()

  const query = history.query

  console.log('SearchForm', query)

  const searchArt = { [typeof window === 'undefined' ? 'value' : 'defaultValue']: decodeURIComponent(query?.art || '') }
  const searchQ = {
    [typeof window === 'undefined' ? 'value' : 'defaultValue']: (decodeURIComponent(query?.q) || '1').replace(
      /\D/g,
      ''
    ),
  }

  const [fields, setFields] = useState({
    quantity: '',
    'art-number': '',
  })
  const [justRedraw, setJustRedraw] = useState(0)
  const [errors, setErrors] = useState({
    quantity: null,
    'art-number': null,
  })
  const [validForm, setValidForm] = useState(false)

  const searchBtnText = history.asPath === '/' ? 'Искать' : 'Продолжить искать'

  useEffect(() => {
    setInputFilter(formQuantity.current, function (value) {
      return !value.length || /^[1-9]\d*$/.test(value) // Allow digits and '.' only, using a RegExp
    })

    if (formArtNumber.current.value.length) {
      handleChange('art-number', { target: formArtNumber.current })

      const form = formRef.current
      const art = form.querySelector('#art-number')
      const quantity = form.querySelector('#quantity')

      onSubmitSearchForm(art.value, quantity.value)
    }

    return () => {
      formRef.current = false
      formArtNumber.current = false
      formQuantity.current = false
      formFile.current = false
    }
  }, [])

  useEffect(() => {
    formArtNumber.current.value = decodeURIComponent((query?.art || '').toUpperCase()).toUpperCase()
    formQuantity.current.value = (decodeURIComponent(query?.q) || '1').replace(/\D/g, '')
  }, [query])

  const handleSubmit = (evt) => {
    handleChange('art-number', { target: formArtNumber.current })

    if (evt !== undefined && evt.preventDefault) evt.preventDefault()

    const form = evt.currentTarget
    const art = form.querySelector('#art-number')
    const quantity = form.querySelector('#quantity')

    onSubmitSearchForm(art.value, quantity.value)
  }

  const handleChange = (field, e) => {
    fields[field] = e.target.value
    setFields(fields)

    switch (field) {
      case 'art-number':
      case 'quantity':
        errors[field] = e.target.value.length ? '' : 'Не может быть пустым'
        break
    }

    setErrors(errors)

    setValidForm(errors['art-number'] !== null && !errors['art-number'])

    //setJustRedraw(justRedraw + 1)
  }

  console.log('render SearchForm')

  return (
    <div className="form-search" itemScope itemType="https://schema.org/WebSite">
      <meta itemProp="url" content="https://catpart.ru/" />
      <form ref={formRef} className="form-content" onSubmit={handleSubmit}>
        <meta itemProp="target" content={'https://catpart.ru/search/?art={art-number}&q={quantity}'} />
        <div className="form-search__title">
          Поиск электронных <br /> компонентов
        </div>

        <div className="row">
          <div className="form-cell column sm-col-12 md-col-5 lg-col-4 xl-col-3">
            <label className="form-label" htmlFor="art-number">
              Номер компонента
            </label>

            <FormInput
              onChange={handleChange.bind(this, 'art-number')}
              onBlur={(e) => {
                e.target.value = e.target.value.trim()
              }}
              itemprop="query-input"
              name="art-number"
              //
              disabled={formBusy}
              className={`__lg${errors['art-number'] === null ? '' : errors['art-number'] ? ' __error' : ''}`}
              error={null}
              id="art-number"
              inputRef={formArtNumber}
              {...searchArt}
            />

            <div className="form-tip">
              <span>Например, </span>
              <span
                aria-hidden="true"
                className="form-tip__example"
                onClick={() => {
                  formArtNumber.current.value = '15C01M'
                  handleChange('art-number', { target: formArtNumber.current })
                }}
              >
                15C01M
              </span>
            </div>
          </div>

          <div className="form-cell column sm-col-12 md-col-3 lg-col-2_5 xl-col-2">
            <label className="form-label" htmlFor="quantity">
              Количество
            </label>

            <FormInput
              onChange={handleChange.bind(this, 'quantity')}
              onBlur={(e) => {
                if (!e.target.value.length) {
                  e.target.value = '1'
                  handleChange('quantity', e)
                }
              }}
              itemprop="query-input"
              name="quantity"
              //
              disabled={formBusy}
              className={`__lg${errors.quantity === null ? '' : errors.quantity ? ' __error' : ''}`}
              error={null}
              id="quantity"
              inputRef={formQuantity}
              {...searchQ}
            />

            <div className="form-tip">
              <span
                aria-hidden="true"
                className="form-tip__example"
                onClick={() => {
                  formQuantity.current.value = '100'
                  handleChange('quantity', { target: formQuantity.current })
                }}
              >
                100
              </span>
              <span
                aria-hidden="true"
                className="form-tip__example"
                onClick={() => {
                  formQuantity.current.value = '250'
                  handleChange('quantity', { target: formQuantity.current })
                }}
              >
                250
              </span>
              <span
                aria-hidden="true"
                className="form-tip__example"
                onClick={() => {
                  formQuantity.current.value = '500'
                  handleChange('quantity', { target: formQuantity.current })
                }}
              >
                500
              </span>
            </div>
          </div>

          <div className="form-cell form-cell__search column sm-col-12 md-col-4 lg-col-2_5 xl-col-2">
            <span className="form-label">&nbsp;</span>
            <div className="form-control">
              <Ripples className={'__w-100p btn __blue __lg' + (formBusy ? ' __loader' : '')} during={1000}>
                <button disabled={formBusy} className={'btn-inner __abs'}>
                  <span>{searchBtnText}</span>
                </button>
              </Ripples>
            </div>
          </div>

          <div className="form-cell column form-cell__or sm-col-12 md-col-4 lg-col-2_5 xl-col-2">
            <span className="form-label">&nbsp;</span>
            <div data-or="или" className="form-control">
              <Ripples className="__w-100p btn __lg __gray-dash" during={1000}>
                <label className="btn-inner __abs">
                  <span>Загрузить BOM</span>
                  <input
                    className="hide"
                    ref={formFile}
                    id="file"
                    type="file"
                    onChange={() => {
                      const requestURL = '/search/bom'
                      const file = formFile.current.files[0]

                      if (file && file.name.match(/\.(xls[x]?)$/)) {
                        const formData = new FormData()
                        const options = {}

                        setSearchData({})
                        dispatch(setFormBusy(true))

                        formData.append('file', file)

                        history.push('/search/', undefined, { shallow: true })

                        apiPOST(requestURL, formData, options, (data) => {
                          if (data.error) {
                            dispatch(setFormBusy(false))
                            notificationFunc('success', `Файл: ${file.name}`, 'ошибка обработки')
                            history.push('/', undefined, { shallow: true })
                          } else {
                            dispatch(setFormBusy(false))
                            setSearchData(data)
                          }
                        })

                        notificationFunc('success', `Файл: ${file.name}`, 'отправлен')
                      } else {
                        file &&
                          notificationFunc('success', `Файл: ${file.name}`, 'не соответствует формату .xls, . xlsx')
                      }

                      // readFile(formFile.current.files[0], ret => {
                      // devMode &&    console.log('readFile', ret);
                      //
                      //  if (ret.success) {
                      //    notificationFunc('success', `Файл: ${ret.name}`, `Размер: ${ret.size}`);
                      //  } else {
                      //    notificationFunc('success', `Файл: ${ret.name}`, `Ошибка: ${ret.text}`);
                      //  }
                      // });
                    }}
                  />
                </label>
              </Ripples>
            </div>
            <div className="form-tip">Выберите или перетащите сюда файл</div>
          </div>
        </div>

        {/* <label style={{ position: 'absolute' }} htmlFor="artNumber"> */}
        {/*  <Input id="artNumber" type="text" placeholder="mxstbr" value={artNumber} onChange={onChangeUsername} /> */}
        {/* </label> */}
      </form>
    </div>
  )
}

SearchForm.propTypes = {
  loading: PropTypes.bool,
  notificationFunc: PropTypes.func,
  onSubmitSearchForm: PropTypes.func,
  onChangeUsername: PropTypes.func,
}

export default SearchForm
