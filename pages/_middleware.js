import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req, ev) {
  const pathname = req.nextUrl.pathname.split('/')
  const options = req.page
  const page = req.url.split('/')[1]
  const pID = req.url.split('/')[2]

  console.log('middleware', page, pID, options)

  if (page === 'catalog') {
    if (pID && parseInt(pID) < 2) {
      return NextResponse.redirect('/' + page)
    }
  }

  return NextResponse.next()
}
