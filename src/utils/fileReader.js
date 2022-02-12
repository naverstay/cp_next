import { tsv2json } from 'tsv-json'
import XLSX from 'xlsx'

export const readFile = (file, cb) => {
  const txtReader = new FileReader()
  const xlsFile = file && file.name.match(/\.(xls[x]?)$/)

  window.log && console.log('file', file)

  const response = (obj) => {
    if (typeof cb === 'function') {
      obj.name = file.name
      obj.size = file.size
      cb(obj)
    }
  }

  txtReader.onload = function () {
    window.log && console.log('readFile', txtReader, txtReader.result)

    if (xlsFile) {
      const data = new Uint8Array(txtReader.result)
      const workbook = XLSX.read(data, { type: 'array' })

      window.log && console.log('workbook', workbook)

      if (workbook.SheetNames.length) {
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const csv = XLSX.utils.sheet_to_json(sheet)

        response({ success: true, text: csv })
      } else {
        response({ success: false, text: 'В таблице нет данных' })
      }
    } else {
      let ret = txtReader.result

      if (file.name.match(/\.tsv$/)) {
        window.log && console.log('TSV')
        ret = tsv2json(ret)
      }

      response({ success: true, text: ret })
    }
  }

  txtReader.onerror = function () {
    window.log && console.log('readFile', txtReader.error)

    response({ success: false, text: '' })
  }

  if (file && file.name.match(/\.([c|t]sv|txt|xls[x]?)$/)) {
    txtReader[xlsFile ? 'readAsArrayBuffer' : 'readAsText'](file)
  } else if (typeof cb === 'function') {
    response({
      success: false,
      text: 'Файл не соответствует формату .txt, .csv, .tsv, .xls, . xlsx',
    })
  }
}
