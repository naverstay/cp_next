export function setInputFilter(textBox, inputFilter) {
  ;['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach(function (event) {
    textBox.addEventListener(event, function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value
        this.oldSelectionStart = this.selectionStart
        this.oldSelectionEnd = this.selectionEnd
      } else if (this.hasOwnProperty('oldValue')) {
        this.value = this.oldValue
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd)
      } else {
        this.value = ''
      }
    })
  })
}
