/**
 * Requests a URL, returning a promise
 *
 * @param  {string} text                   The text we want to copy
 * @param  {function} successCopy          Success callback
 * @param  {function} failCopy             Fail callback
 *
 * @return {object}           The response data
 */

export default function copyTextToClipboard(text, successCopy, failCopy) {
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')

      if (successful) {
        successCopy(text)
      } else {
        failCopy()
      }
    } catch (err) {
      failCopy()
    }

    document.body.removeChild(textArea)
  }

  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(
    function () {
      successCopy(text)
    },
    function (err) {
      failCopy()
    }
  )
}
