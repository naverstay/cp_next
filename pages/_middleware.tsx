import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: { nextUrl: { pathname: string } }, ev: any) {
  const { pathname } = req.nextUrl

  // console.log('middleware', req.nextUrl)

  // if (pathname === '/') {
  //   return NextResponse.redirect('/hello-nextjs')
  // }
  return NextResponse.next()
}
