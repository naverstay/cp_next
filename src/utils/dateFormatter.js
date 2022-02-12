/**
 * Форматирование даты
 *
 * @param  {string} val       The value to format
 * @param  {boolean} time     Add HH:MM
 *
 * @return {string}           The response string
 */

const leadingZero = (val) => `0${val}`.slice(-2)

function join(t, a, s) {
  function format(m) {
    const f = new Intl.DateTimeFormat('en', m)
    return f.format(t)
  }

  return a.map(format).join(s)
}

export default function dateFormatter(val, time) {
  if (!val) {
    return '--.--.----'
  }

  val = new Date(val)

  const date = join(val, [{ day: '2-digit' }, { month: '2-digit' }, { year: 'numeric' }], '.')

  return date + (time ? ` ${leadingZero(val.getHours())}:${leadingZero(val.getMinutes())}` : '')
}
