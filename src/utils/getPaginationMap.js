/**
 * Создание кнопок пагинации
 *
 * @param number pagesCount
 * @param number activePage
 *
 * @returns []
 */

const MAX_DISPLAY_PAGES = 3
const MARGIN_PAGES_DISPLAY = 1

export const getButtonsMap = (pagesCount, activePage) => {
  const items = []
  if (pagesCount <= MAX_DISPLAY_PAGES) {
    for (let index = 0; index < pagesCount; index++) {
      items.push({ text: String(index + 1), isMore: false })
    }
  } else {
    let leftSide = MAX_DISPLAY_PAGES / 2
    let rightSide = MAX_DISPLAY_PAGES - leftSide
    if (activePage > pagesCount - MAX_DISPLAY_PAGES / 2) {
      rightSide = pagesCount - activePage
      leftSide = MAX_DISPLAY_PAGES - rightSide
    } else if (activePage < MAX_DISPLAY_PAGES / 2) {
      leftSide = activePage
      rightSide = MAX_DISPLAY_PAGES - leftSide
    }
    let index, page
    for (index = 0; index < pagesCount; index++) {
      page = index + 1
      if (page <= MARGIN_PAGES_DISPLAY) {
        items.push({ text: String(index + 1), isMore: false })
      } else if (page > pagesCount - MARGIN_PAGES_DISPLAY) {
        items.push({ text: String(index + 1), isMore: false })
      } else if (index > activePage - leftSide - 2 && index < activePage + rightSide) {
        items.push({ text: String(index + 1), isMore: false })
      } else if (items[items.length - 1].isMore !== true) {
        items.push({ text: '...', isMore: true })
      }
    }
  }
  return items
}
