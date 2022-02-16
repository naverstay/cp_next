//eslint-disable-next-line @typescript-eslint/no-var-requires
const { createServer } = require('http')
//eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse } = require('url')

//eslint-disable-next-line @typescript-eslint/no-var-requires
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
// when using middleware `hostname` and `port` must be provided below

const app = next({ dev, hostname, port })

const APP_ROUTES = [
  'index',
  'about',
  'bankinformation',
  'contacts',
  'delivery',
  'index',
  'order',
  'orders',
  'privacy-policy',
  'search',
  'test',
]

//eslint-disable-next-line @typescript-eslint/no-var-requires
const handler = require('./routes').getRequestHandler(app, ({ req, res, route, query }) => {
  const page = req.url.split('/')[1]
  const pID = req.url.split('/')[2]
  let newRoute = '/' + page

  if (APP_ROUTES.indexOf(page) === -1) {
    newRoute = '/catalog'
  }

  if (page === 'catalog') {
    if (pID && parseInt(pID) > 1) {
      newRoute += '/' + pID
    } else {
      console.log('redirect', page)
      //req.redirect('/' + page)
    }
  }

  console.log('handler', req.url, page, newRoute)

  app.render(req, res, newRoute, query)
})

app.prepare().then(() => {
  createServer(handler).listen(port, (err) => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
