/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Ripples from 'react-ripples'
// Import React Table
//import { useTable, useBlockLayout, usePagination } from 'react-table'
//import { useSticky } from 'react-table-sticky'

import ReactTable from 'react-table'
// Import React Table HOC Fixed columns
import withFixedColumns from 'react-table-hoc-fixed-columns'

const ReactTableFixedColumns = withFixedColumns(ReactTable)

import apiGET from '../../utils/search'
import FormInput from '../FormInput'
import LoadingIndicator from '../LoadingIndicator'

import NextLink from '@/components/NextLink'

export default function CataloguePage(props) {
  const rtCellSizer = typeof window === 'undefined' ? null : document.getElementById('rtCellSizer')
  const tableHolder = React.createRef()

  const {
    categoryItems,
    setCategorySort,
    categorySortField,
    catColumnsList,
    nestedCategories,
    categoryInfo,
    categoryFilter,
    setCategoryFilter,
    categoryFilterNames,
    showCatPreloader,
    filterItemsHTML,
  } = props

  console.log('CataloguePage', props)

  const history = useRouter()

  const [openFilterDropdown, setOpenFilterDropdown] = useState(false)
  const [openMobFilterDropdown, setOpenMobFilterDropdown] = useState(false)

  const [filterColumn, setFilterColumn] = useState('')
  const [filterSelection, setFilterSelection] = useState(null)
  const [columnOptions, setColumnOptions] = useState([])
  const [filterOptions, setFilterOptions] = useState([])
  const [filterText, setFilterText] = useState('')

  const openFilterRef = useDetectClickOutside({
    onTriggered: (e) => {
      if (
        !(
          e.target.closest('.catalogue-page__table-sorter') ||
          e.target.closest('.catalogue-page__filter-popup') ||
          e.target.closest('.catalogue-page__filter-dropdown')
        )
      ) {
        setOpenFilterDropdown(false)
        setFilterOptions([])
      }
    },
  })

  const openMobFilterRef = useDetectClickOutside({
    onTriggered: (e) => {
      if (
        !(
          e.target.closest('.catalogue-page__table-sorter') ||
          e.target.closest('.catalogue-page__filter-popup') ||
          e.target.closest('.catalogue-page__filter-dropdown')
        )
      ) {
        setOpenMobFilterDropdown(false)
        setFilterOptions([])
      }
    },
  })

  function chunkArray(myArray, chunk_size) {
    let results = []

    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size))
    }

    return results
  }

  let title = categoryInfo && categoryInfo.hasOwnProperty('name') ? categoryInfo.name : ''

  const rtSortExtension = (col, id) => {
    return (
      <div className={'catalogue-page__table-sorter'}>
        <div
          aria-hidden="true"
          className="sort-btn btn __gray"
          onClick={() => {
            if (id.indexOf('no_id') === 0) {
              console.log('no id', col)
            } else {
              if (col === filterColumn) {
                setOpenFilterDropdown(false)
              } else {
                setOpenMobFilterDropdown(false)
                setFilterColumn(col)
                setOpenFilterDropdown(true)
              }
            }
          }}
        >
          <span />
        </div>
        <div className="catalogue-page__table-tip">Фильтр</div>
      </div>
    )
  }

  const getColumnWidth = (accessor, headerText, bold) => {
    if (!rtCellSizer) {
      return 200
    }

    const maxWidth = 600
    const padding = 23
    const cellLength = Math.max(
      ...(headerText || '').split(' ').map((h) => {
        rtCellSizer.style.fontWeight = bold
        rtCellSizer.innerText = h || ''
        return Math.ceil(padding + rtCellSizer.offsetWidth)
      }),
      ...categoryItems.map((row) => {
        rtCellSizer.style.fontWeight = bold
        rtCellSizer.innerText = row[accessor] || ''
        return Math.ceil(padding + rtCellSizer.offsetWidth)
      })
    )
    return cellLength
  }

  const handleScroll = (event) => {
    const table = document.querySelector('.ReactTable')
    const header = document.querySelector('.ReactTable .-header')
    const headerGroups = document.querySelector('.ReactTable .-headerGroups')

    if (table && header && headerGroups) {
      const offset = -1 * Math.min(0, headerGroups.getBoundingClientRect().height + table.getBoundingClientRect().top)

      header.style.transform = `translateY(${offset}px)`
      openFilterRef.current.style.transform = `translateY(${
        offset ? offset + headerGroups.getBoundingClientRect().height + header.getBoundingClientRect().height + 80 : 0
      }px)`
      header.classList[offset ? 'add' : 'remove']('__fixed')
    }
  }

  useEffect(() => {
    document.body.addEventListener('scroll', handleScroll)

    return () => {
      document.body.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setOpenFilterDropdown(false)
  }, [categoryItems])

  useEffect(() => {
    if (openFilterDropdown) {
      let requestURL = ''
      if (filterColumn === 'catManufacturer') {
        requestURL = '/catalog/manufacturers'
      } else {
        let item = catColumnsList.find((f) => f.accessor === filterColumn)
        if (item && item.hasOwnProperty('attributeId')) {
          if (item.attributeId.indexOf('no_id') < 0) {
            requestURL = `/catalog/attributes/${item.attributeId}/values`
          } else {
            console.log('no id', item)
          }
        }
      }

      if (requestURL) {
        apiGET(requestURL, {}, (data) => {
          setFilterOptions(data)
        })
      }
    } else {
      setFilterColumn('')
    }
  }, [openFilterDropdown, filterColumn])

  useEffect(() => {
    setFilterText('')
    setFilterOptions([])

    let filter = categoryFilter.find((f) => f.name === filterColumn)

    setFilterSelection(filter)
  }, [categoryItems, filterColumn])

  useEffect(() => {
    setColumnOptions(filterOptions.filter((f) => f && f.toLowerCase().indexOf(filterText) === 0))
  }, [filterOptions, filterText])

  const nestedCategoriesItems = useMemo(() => {
    let ret = [[], [], [], []]

    nestedCategories.forEach((s, si) => {
      ret[si % 4].push(
        <NextLink to={'/' + s.slug + '/'} key={si} className={'catalogue__list-link'}>
          {s.name}
        </NextLink>
      )
    })

    return ret
  }, [nestedCategories])

  const defaultColumn = React.useMemo((col, i) => {
    console.log('defaultColumn', col, i)
    return {
      minWidth: 150,
      width: 150,
      maxWidth: 400,
    }
  }, [])

  console.log('categoryItems', categoryItems)

  const Table = ({ columns, data }) => {
    // Use the state and functions returned from useTable to build your UI
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
      {
        columns,
        data,
      }
      //usePagination,
      //useBlockLayout,
      //useSticky
    )

    console.log('columns', columns)

    // Render the UI for your table
    return (
      <div className={'rt-table'} {...getTableProps()}>
        {headerGroups.map((headerGroup, hi) => {
          return (
            <div key={hi} className={'rt-thead ' + (hi ? '-header' : '-headerGroups')}>
              <div className={'rt-tr-group'}>
                <div {...headerGroup.getHeaderGroupProps()} className={'rt-tr '}>
                  {headerGroup.headers.map((column, ci) => {
                    return hi ? (
                      <div key={ci} {...column.getHeaderProps()} className={'rt-th'}>
                        {column.render('Header')}
                      </div>
                    ) : (
                      <div key={ci} {...column.getHeaderProps()} className={'rt-th'}>
                        <div className={'rt-resizable-header'}>
                          <div className={'rt-resizable-header-content'}>{column.render('Header')}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        <div className={'rt-tbody'} {...getTableBodyProps()}>
          {rows.map((row, ri) => {
            prepareRow(row)
            return (
              <div key={ri} className={'rt-tr-group'}>
                <div {...row.getRowProps()} className={'rt-tr ' + (ri % 2 ? '-odd' : '-even')}>
                  {row.cells.map((cell, ci) => {
                    return (
                      <div key={ci} {...cell.getCellProps()} className={'rt-td'}>
                        {cell.render('Cell')}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Visits',
            accessor: 'visits',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  const catalogHTML = useMemo(() => {
    return categoryItems?.length ? (
      <React.Fragment>
        {/*<div className={'ReactTable catalogue-striped'}>*/}
        {/*  <Table*/}
        {/*    key={categoryItems.length}*/}
        {/*    //columns={columns}*/}
        {/*    data={categoryItems}*/}
        {/*    showPagination={false}*/}
        {/*    showPageJump={false}*/}
        {/*    sortable={false}*/}
        {/*    getTdProps={(state, rowInfo, column, instance) => {*/}
        {/*      return {*/}
        {/*        onMouseEnter: (e) => {*/}
        {/*          let nodes = Array.prototype.slice.call(e.target.parentNode.children)*/}
        {/*          const index = nodes.indexOf(e.target)*/}
        {/*          let header = e.target.closest('.rt-table').querySelector('.rt-thead.-header')*/}

        {/*          Array.prototype.slice.call(header.querySelectorAll('.rt-th')).forEach((h, hi) => {*/}
        {/*            h.classList[index === hi ? 'add' : 'remove']('__hover')*/}
        {/*          })*/}
        {/*        },*/}
        {/*        onMouseLeave: (e) => {*/}
        {/*          let nodes = Array.prototype.slice.call(e.target.parentNode.children)*/}
        {/*          let header = e.target.closest('.rt-table').querySelector('.rt-thead.-header')*/}
        {/*          Array.prototype.slice*/}
        {/*            .call(header.querySelectorAll('.rt-th'))*/}
        {/*            [nodes.indexOf(e.target)].classList.remove('__hover')*/}
        {/*        },*/}
        {/*      }*/}
        {/*    }}*/}
        {/*    columns={[*/}
        {/*      {*/}
        {/*        Header: '',*/}
        {/*        id: 'photo',*/}
        {/*        sticky: 'left',*/}
        {/*        columns: [*/}
        {/*          {*/}
        {/*            Header: (*/}
        {/*              <div className={'catalogue-page__table-cell text-center'}>*/}
        {/*                <span>Фото</span>*/}
        {/*              </div>*/}
        {/*            ),*/}
        {/*            id: 'catImage',*/}
        {/*            accessor: 'catImage',*/}
        {/*            Cell: (tableProps) => {*/}
        {/*              return (*/}
        {/*                <span className={'catalogue-page__table-image'}>*/}
        {/*                  {tableProps.row.catImage ? (*/}
        {/*                    <img*/}
        {/*                      //effect="opacity"*/}
        {/*                      src={tableProps.row.catImage}*/}
        {/*                      // placeholder={<span className={"catalogue-page__table-loader"} />}*/}
        {/*                      alt={tableProps.row.catPartNum}*/}
        {/*                    />*/}
        {/*                  ) : null}*/}
        {/*                </span>*/}
        {/*              )*/}
        {/*            },*/}
        {/*            minWidth: 10,*/}
        {/*            width: 70,*/}
        {/*          },*/}
        {/*          {*/}
        {/*            Header: (*/}
        {/*              <div*/}
        {/*                aria-hidden="true"*/}
        {/*                onClick={(e) => {*/}
        {/*                  if (!e.target.classList.contains('sort-btn')) {*/}
        {/*                    setCategorySort('title')*/}
        {/*                  }*/}
        {/*                }}*/}
        {/*                className={'catalogue-page__table-cell text-center'}*/}
        {/*              >*/}
        {/*                <span style={{ fontWeight: categorySortField === 'title' ? 'bold' : 400 }}>Номер детали</span>*/}
        {/*              </div>*/}
        {/*            ),*/}
        {/*            id: 'catPartNum',*/}
        {/*            accessor: 'catPartNum',*/}
        {/*            Cell: (tableProps) => {*/}
        {/*              console.log('tableProps', tableProps.row.original)*/}
        {/*              return tableProps.row.original.catPartLink ? (*/}
        {/*                <div className={'catalogue-page__table-name'}>*/}
        {/*                  <NextLink*/}
        {/*                    className={'catalogue-page__table-link'}*/}
        {/*                    to={'/' + tableProps.row.original.catPartLink + '/'}*/}
        {/*                  >*/}
        {/*                    {tableProps.row.catPartNum}*/}
        {/*                  </NextLink>*/}
        {/*                  <div*/}
        {/*                    aria-hidden="true"*/}
        {/*                    className={'catalogue-page__table-expander icon icon-chevron-up'}*/}
        {/*                    onClick={(e) => {*/}
        {/*                      e.target.closest('.rt-tr').classList.toggle('__opened')*/}
        {/*                    }}*/}
        {/*                  />*/}
        {/*                </div>*/}
        {/*              ) : (*/}
        {/*                <span>{tableProps.row.catPartNum}</span>*/}
        {/*              )*/}
        {/*            },*/}
        {/*            // width: 170,*/}
        {/*            minWidth: 10,*/}
        {/*            width: getColumnWidth('catPartNum', 'Номер детали', categorySortField === 'title' ? 'bold' : 400),*/}
        {/*          },*/}
        {/*          {*/}
        {/*            // Header: <div className={"text-center"}>Производитель</div>,*/}
        {/*            id: 'catManufacturer',*/}
        {/*            accessor: 'catManufacturer',*/}
        {/*            Header: (tableProps) => {*/}
        {/*              return (*/}
        {/*                <div*/}
        {/*                  aria-hidden="true"*/}
        {/*                  className={'catalogue-page__table-cell text-center'}*/}
        {/*                  onClick={(e) => {*/}
        {/*                    if (!e.target.classList.contains('sort-btn')) {*/}
        {/*                      setCategorySort('manufacturer')*/}
        {/*                    }*/}
        {/*                  }}*/}
        {/*                >*/}
        {/*                  <span style={{ fontWeight: categorySortField === 'manufacturer' ? 'bold' : 400 }}>*/}
        {/*                    Производитель*/}
        {/*                  </span>*/}
        {/*                  {rtSortExtension('catManufacturer', 'm')}*/}
        {/*                </div>*/}
        {/*              )*/}
        {/*            },*/}
        {/*            Cell: (tableProps) => {*/}
        {/*              return (*/}
        {/*                <span className={'text-center catalogue-page__table-param'}>*/}
        {/*                  <span className={'catalogue-page__table-key'}>Производитель</span>*/}
        {/*                  <span className={'catalogue-page__table-value white-space__normal'}>*/}
        {/*                    {tableProps.row.catManufacturer}*/}
        {/*                  </span>*/}
        {/*                </span>*/}
        {/*              )*/}
        {/*            },*/}
        {/*            minWidth: 10,*/}
        {/*            width: getColumnWidth(*/}
        {/*              'catManufacturer',*/}
        {/*              'Производитель',*/}
        {/*              categorySortField === 'manufacturer' ? 'bold' : 400*/}
        {/*            ),*/}
        {/*            // width: 110*/}
        {/*          },*/}
        {/*        ],*/}
        {/*      },*/}
        {/*      {*/}
        {/*        Header: '',*/}
        {/*        id: 'attributes',*/}
        {/*        columns: [].concat(*/}
        {/*          catColumnsList.map((c, ci) => {*/}
        {/*            //eslint-disable-next-line react/display-name*/}
        {/*            c.Header = (tableProps) => {*/}
        {/*              return (*/}
        {/*                <div*/}
        {/*                  aria-hidden="true"*/}
        {/*                  className={'catalogue-page__table-cell'}*/}
        {/*                  onClick={(e) => {*/}
        {/*                    if (!e.target.classList.contains('sort-btn')) {*/}
        {/*                      if (c.attributeId.indexOf('no_id') === 0) {*/}
        {/*                        console.log('attributes', c)*/}
        {/*                      } else {*/}
        {/*                        setCategorySort('attributes.' + c.attributeId)*/}
        {/*                      }*/}
        {/*                    }*/}
        {/*                  }}*/}
        {/*                >*/}
        {/*                  <span*/}
        {/*                    style={{ fontWeight: categorySortField === 'attributes.' + c.attributeId ? 'bold' : 400 }}*/}
        {/*                  >*/}
        {/*                    {c.accessor}*/}
        {/*                  </span>*/}
        {/*                  {rtSortExtension(c.accessor, c.attributeId)}*/}
        {/*                </div>*/}
        {/*              )*/}
        {/*            }*/}

        {/*            c.minWidth = 10*/}
        {/*            c.width = getColumnWidth(*/}
        {/*              c.accessor,*/}
        {/*              c.accessor,*/}
        {/*              categorySortField === 'attributes.' + c.attributeId ? 'bold' : 400*/}
        {/*            )*/}

        {/*            //eslint-disable-next-line react/display-name*/}
        {/*            c.Cell = (cell) => {*/}
        {/*              let name = catColumnsList.find((f) => f.attributeId === cell.column.attributeId).accessor*/}

        {/*              return (*/}
        {/*                <span*/}
        {/*                  className={'text-center catalogue-page__table-param' + (cell.value ? '' : ' mob-hidden__')}*/}
        {/*                >*/}
        {/*                  <span className={'catalogue-page__table-key'}>{name}</span>*/}
        {/*                  <span className={'catalogue-page__table-value'}>{cell.value}</span>*/}
        {/*                </span>*/}
        {/*              )*/}
        {/*            }*/}

        {/*            return c*/}
        {/*          })*/}
        {/*        ),*/}
        {/*      },*/}
        {/*    ]}*/}
        {/*    defaultPageSize={categoryItems.length}*/}
        {/*    // style={{ height: 500 }}*/}
        {/*    className="catalogue-striped"*/}
        {/*  />*/}
        {/*</div>*/}

        <ReactTableFixedColumns
          key={categoryItems.length}
          data={categoryItems}
          showPagination={false}
          showPageJump={false}
          sortable={false}
          getTdProps={(state, rowInfo, column, instance) => {
            return {
              onMouseEnter: (e) => {
                let nodes = Array.prototype.slice.call(e.target.parentNode.children)
                const index = nodes.indexOf(e.target)
                let header = e.target.closest('.rt-table').querySelector('.rt-thead.-header')

                Array.prototype.slice.call(header.querySelectorAll('.rt-th')).forEach((h, hi) => {
                  h.classList[index === hi ? 'add' : 'remove']('__hover')
                })
              },
              onMouseLeave: (e) => {
                let nodes = Array.prototype.slice.call(e.target.parentNode.children)
                let header = e.target.closest('.rt-table').querySelector('.rt-thead.-header')
                Array.prototype.slice
                  .call(header.querySelectorAll('.rt-th'))
                  [nodes.indexOf(e.target)].classList.remove('__hover')
              },
            }
          }}
          columns={[
            {
              Header: '',
              fixed: 'left',
              columns: [
                {
                  Header: (
                    <div className={'catalogue-page__table-cell text-center'}>
                      <span>Фото</span>
                    </div>
                  ),
                  accessor: 'catImage',
                  Cell: (tableProps) => {
                    return (
                      <span className={'catalogue-page__table-image'}>
                        {tableProps.row.catImage ? (
                          <LazyLoadImage
                            effect="opacity"
                            src={tableProps.row.catImage}
                            // placeholder={<span className={"catalogue-page__table-loader"} />}
                            alt={tableProps.row.catPartNum}
                          />
                        ) : null}
                      </span>
                    )
                  },
                  minWidth: 10,
                  width: 70,
                },
                {
                  Header: (
                    <div
                      aria-hidden="true"
                      onClick={(e) => {
                        if (!e.target.classList.contains('sort-btn')) {
                          setCategorySort('title')
                        }
                      }}
                      className={'catalogue-page__table-cell text-center'}
                    >
                      <span style={{ fontWeight: categorySortField === 'title' ? 'bold' : 400 }}>Номер детали</span>
                    </div>
                  ),
                  accessor: 'catPartNum',
                  Cell: (tableProps) => {
                    return tableProps.row._original.catPartLink ? (
                      <div className={'catalogue-page__table-name'}>
                        <NextLink
                          className={'catalogue-page__table-link'}
                          to={'/' + tableProps.row._original.catPartLink + '/'}
                        >
                          {tableProps.row.catPartNum}
                        </NextLink>
                        <div
                          aria-hidden="true"
                          className={'catalogue-page__table-expander icon icon-chevron-up'}
                          onClick={(e) => {
                            e.target.closest('.rt-tr').classList.toggle('__opened')
                          }}
                        />
                      </div>
                    ) : (
                      <span>{tableProps.row.catPartNum}</span>
                    )
                  },
                  // width: 170,
                  minWidth: 10,
                  width: getColumnWidth('catPartNum', 'Номер детали', categorySortField === 'title' ? 'bold' : 400),
                },
                {
                  // Header: <div className={"text-center"}>Производитель</div>,
                  accessor: 'catManufacturer',
                  Header: (tableProps) => {
                    return (
                      <div
                        aria-hidden="true"
                        className={'catalogue-page__table-cell text-center'}
                        onClick={(e) => {
                          if (!e.target.classList.contains('sort-btn')) {
                            setCategorySort('manufacturer')
                          }
                        }}
                      >
                        <span style={{ fontWeight: categorySortField === 'manufacturer' ? 'bold' : 400 }}>
                          Производитель
                        </span>
                        {rtSortExtension('catManufacturer', 'm')}
                      </div>
                    )
                  },
                  Cell: (tableProps) => {
                    return (
                      <span className={'text-center catalogue-page__table-param'}>
                        <span className={'catalogue-page__table-key'}>Производитель</span>
                        <span className={'catalogue-page__table-value white-space__normal'}>
                          {tableProps.row.catManufacturer}
                        </span>
                      </span>
                    )
                  },
                  minWidth: 10,
                  width: getColumnWidth(
                    'catManufacturer',
                    'Производитель',
                    categorySortField === 'manufacturer' ? 'bold' : 400
                  ),
                  // width: 110
                },
              ],
            },
            {
              Header: '',
              columns: [].concat(
                catColumnsList.map((c, ci) => {
                  //eslint-disable-next-line react/display-name
                  c.Header = (tableProps) => {
                    return (
                      <div
                        aria-hidden="true"
                        className={'catalogue-page__table-cell'}
                        onClick={(e) => {
                          if (!e.target.classList.contains('sort-btn')) {
                            if (c.attributeId.indexOf('no_id') === 0) {
                              console.log('attributes', c)
                            } else {
                              setCategorySort('attributes.' + c.attributeId)
                            }
                          }
                        }}
                      >
                        <span
                          style={{ fontWeight: categorySortField === 'attributes.' + c.attributeId ? 'bold' : 400 }}
                        >
                          {c.accessor}
                        </span>
                        {rtSortExtension(c.accessor, c.attributeId)}
                      </div>
                    )
                  }

                  c.minWidth = 10
                  c.width = getColumnWidth(
                    c.accessor,
                    c.accessor,
                    categorySortField === 'attributes.' + c.attributeId ? 'bold' : 400
                  )

                  //eslint-disable-next-line react/display-name
                  c.Cell = (cell) => {
                    let name = catColumnsList.find((f) => f.attributeId === cell.column.attributeId).accessor

                    return (
                      <span className={'text-center catalogue-page__table-param' + (cell.value ? '' : ' mob-hidden__')}>
                        <span className={'catalogue-page__table-key'}>{name}</span>
                        <span className={'catalogue-page__table-value'}>{cell.value}</span>
                      </span>
                    )
                  }

                  return c
                })
              ),
            },
          ]}
          defaultPageSize={categoryItems.length}
          // style={{ height: 500 }}
          className="catalogue-striped"
        />
      </React.Fragment>
    ) : null
  }, [categoryItems])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta name="keywords" content={title} />
        <link rel="canonical" href={`https://catpart.ru/${history.asPath.split('/')[1]}/`} />
      </Head>

      {categoryInfo !== null ? (
        <div className="row">
          <div className="column sm-col-12 xl-col-9">
            <article className="article __catalogue">
              <div className="article-title">{categoryInfo.name || ''}</div>
              <p>{categoryInfo.description || ''}</p>
            </article>
          </div>
        </div>
      ) : null}

      {nestedCategories.length ? (
        <div className="catalogue-page__scroller">
          <div className="catalogue-page__snippet">
            {/*{chunkArray(nestedCategories, snippetCount).map((c, ci) => <div key={ci}*/}
            {/*                                                                className={"catalogue-page__snippet-col"}>*/}
            {/*  {c.map((s, si) => <NextLink href={s.slug} key={ci + "_" + si} className={"catalogue__list-link"}>{s.name}</Link>)}*/}
            {/*</div>)}*/}

            {nestedCategoriesItems.map((c, ci) => (
              <React.Fragment key={ci}>{c}</React.Fragment>
            ))}
          </div>
        </div>
      ) : null}

      <ul className={'catalogue-page__filter-data'}>
        {filterItemsHTML}
        <div ref={openMobFilterRef} className={'catalogue-page__filter-item mob-only dropdown-holder'}>
          <Ripples
            onClick={() => {
              setOpenMobFilterDropdown(!openMobFilterDropdown)
            }}
            className={'btn __gray btn__filter-add'}
            during={1000}
          >
            <span className="btn-inner">Добавить фильтр</span>
          </Ripples>
          {openMobFilterDropdown ? (
            <div className={'dropdown-container'}>
              <ul className={'catalogue-page__filter-dropdown'}>
                <li>
                  <Ripples
                    onClick={() => {
                      setOpenMobFilterDropdown(false)
                      setFilterColumn('catManufacturer')
                      setOpenFilterDropdown(true)
                    }}
                    className="dropdown-link"
                    during={1000}
                  >
                    Производитель
                  </Ripples>
                </li>

                {catColumnsList.map((m, mi) => (
                  <li key={mi}>
                    <Ripples
                      onClick={() => {
                        setOpenMobFilterDropdown(false)
                        if (m.attributeId.indexOf('no_id') === 0) {
                          console.log('no id', m)
                        } else {
                          setFilterColumn(m.accessor)
                          setOpenFilterDropdown(true)
                        }
                      }}
                      className="dropdown-link"
                      during={1000}
                    >
                      {m.accessor}
                    </Ripples>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </ul>

      <div ref={openFilterRef} className="catalogue-page__filter">
        {openFilterDropdown ? (
          <div className="catalogue-page__filter-popup">
            <div className={'catalogue-page__filter-title'}>
              {filterColumn === 'catManufacturer' ? 'Производитель' : filterColumn}
            </div>

            <FormInput
              key={filterColumn}
              onChange={(e) => {
                setFilterText(e.target.value.toLowerCase())
              }}
              placeholder={'Искать'}
              itemprop="query-input"
              name="filter-search"
              //
              className={'__lg'}
              error={null}
              id="filter-search"
              // inputRef={formArtNumber}
            />

            <ul className="catalogue-page__filter-options">
              {filterOptions.length ? (
                columnOptions.map((o, oi) => {
                  let checked = false
                  let filter = categoryFilterNames.find((f) => f.name === filterColumn)

                  if (filter && filter.values.indexOf(o) > -1) {
                    checked = true
                  }

                  return (
                    <li key={oi}>
                      <input
                        id={'filter-option_' + oi}
                        defaultChecked={checked}
                        className="hide"
                        value={o}
                        type="checkbox"
                      />
                      <Ripples
                        onClick={() => {
                          let filter

                          if (filterSelection && filterSelection.hasOwnProperty('values')) {
                            const filterIndex = filterSelection.values.findIndex((f) => f === o)

                            if (filterIndex > -1) {
                              filterSelection.values.splice(filterIndex, 1)
                            } else {
                              filterSelection.values.push(o)
                            }

                            filter = filterSelection
                          } else {
                            filter = categoryFilterNames.find((f) => f.name === filterColumn)

                            if (filter) {
                              filter.values = [o]
                            } else {
                              if (filterColumn === 'catManufacturer') {
                                filter = {
                                  id: 'm',
                                  name: 'Производитель',
                                  values: [o],
                                }
                              } else {
                                let item = catColumnsList.find((f) => f.accessor === filterColumn)

                                filter = {
                                  id: item.attributeId,
                                  name: item.accessor,
                                  values: [o],
                                }
                              }
                            }
                          }

                          setFilterSelection(filter)
                        }}
                        className={'dropdown-link'}
                        during={1000}
                      >
                        <label htmlFor={'filter-option_' + oi}>
                          <span>{o}</span>
                        </label>
                      </Ripples>
                    </li>
                  )
                })
              ) : (
                <LoadingIndicator />
              )}
            </ul>

            <Ripples
              onClick={() => {
                let filterAttr = []
                let param = catColumnsList.find((f) => f.accessor === filterColumn)

                if (param) {
                  let attrId = filterColumn === 'catManufacturer' ? 'm' : param.attributeId
                  let filter = categoryFilterNames.find((f) => f.id === attrId)

                  if (filter) {
                    filter.values = filterSelection.values
                  } else {
                    filterAttr.push(filterSelection)
                  }
                } else if (filterColumn === 'catManufacturer') {
                  let filter = categoryFilterNames.find((f) => f.id === 'm')

                  if (filter) {
                    filter.values = filterSelection.values
                  } else {
                    filterAttr.push(filterSelection)
                  }
                }

                setCategoryFilter(categoryFilterNames.concat(filterAttr).filter((f) => f.values.length))

                setOpenFilterDropdown(false)
              }}
              className="btn __blue __lg __w-100p"
              during={1000}
            >
              <span className="btn-inner">
                <span>Применить</span>
              </span>
            </Ripples>
          </div>
        ) : null}
      </div>

      <div ref={tableHolder} className="catalogue-page__full">
        {showCatPreloader ? <div className={'catalogue-page__loader'} /> : catalogHTML}
      </div>
    </>
  )
}
