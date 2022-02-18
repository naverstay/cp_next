const APP_ROUTES = [
  'index',
  'about',
  'bankinformation',
  'contacts',
  'delivery',
  'index',
  'order',
  'orders',
  'catalog',
  'privacy-policy',
  'search',
  'test',
]

//eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path')
//eslint-disable-next-line @typescript-eslint/no-var-requires
const url = require('url')
//eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse } = require('url')

//eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express')
//eslint-disable-next-line @typescript-eslint/no-var-requires
const LRUCache = require('lru-cache')
//eslint-disable-next-line @typescript-eslint/no-var-requires
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dir: '.', dev })
const handle = app.getRequestHandler()

const ssrCache = new LRUCache({
  max: 100,
  ttl: dev ? 5 : 1000 * 60 * 60, // 1hour
})

app.prepare().then(() => {
  const server = express()

  // Use the `renderAndCache` utility defined below to serve pages
  server.get('/', (req, res) => renderAndCache(req, res, '/'))

  //server.get('/:url*', (req, res, next) => {
  //  //let page = `${req.url.pathname}/${req.url.search}`.replace(/\/\//g, '/')
  //
  //  if (req.url.length > 1 && processUrl(req.url.split('/')[1])) {
  //    console.log('redirectSlash', req.url, req.search)
  //
  //    let page = '/'
  //
  //    return res.redirect(
  //      url.format({
  //        pathname: page,
  //      })
  //    )
  //  }
  //
  //  next()
  //})

  server.get('/:first/:second?', (req, res, next) => {
    const firstParam = req.params.first ? req.params.first.toLowerCase() : null
    const secondParam = req.params.second ? req.params.second.toLowerCase() : null

    // Prevent routes that should not be handled by this logic and send them to the next route in line
    if (processUrl(firstParam)) {
      // initialize variables
      let page = getPageName(req)
      let id = null

      if (Object.values(req.params).filter(Boolean).length === 1) {
        // Logic for routes with 1 parameter
        console.log('one parameter', req.params, page)
        // Set up default values for routes with 1 parameter
      } else if (Object.values(req.params).filter(Boolean).length === 2) {
        // Logic for routes with 2 parameters
        id = secondParam

        console.log('two parameters', req.params, page, id, !(parseInt(id) > 1))
        // Set up default values for routes with 2 parameters

        if (page === '/catalog') {
          if (!(parseInt(id) > 1)) {
            console.log('resetID')
            id = null
            return res.redirect(
              url.format({
                pathname: page,
              })
            )
          }
        } else if (id !== null) {
          if (APP_ROUTES.indexOf(req.params.first) === -1) {
            console.log('resetID')
            id = null
            return res.redirect(
              url.format({
                pathname: page,
              })
            )
          }
        }
      }
      return renderAndCache(req, res, page, { id, route: req.params.first })
    }
    return next()
  })

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname)

      app.serveStatic(req, res, filePath)
    } else {
      handle(req, res, parsedUrl)
    }
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

/*
 * NB: make sure to modify this to take into account anything that should trigger
 * an immediate page change (e.g a locale stored in req.session)
 */
function getCacheKey(req) {
  return `${req.url}`
}

function processUrl(url) {
  return (
    !(url.indexOf('_next') === 0) &&
    !(url.indexOf('__nextjs') === 0) &&
    !(url.indexOf('favicon') === 0) &&
    url !== '_next' &&
    url !== 'robots.txt' &&
    url !== 'service-worker.js' &&
    url !== 'site.webmanifest' &&
    url !== 'static' &&
    url !== 'json'
  )
}

function getPageName(req) {
  if (APP_ROUTES.indexOf(req.params.first) === -1) {
    return '/catalog/'
  } else {
    return '/' + req.params.first + '/'
  }
}

function renderAndCache(req, res, pagePath, queryParams) {
  const key = getCacheKey(req)

  // If we have a page in the cache, let's serve it
  if (ssrCache.has(key)) {
    console.log(`CACHE HIT: ${key}`)
    res.send(ssrCache.get(key))
    return
  }

  // If not let's render the page into HTML
  app
    .renderToHTML(req, res, pagePath, queryParams)
    .then((html) => {
      // Let's cache this page
      console.log(`CACHE MISS: ${key}`)
      ssrCache.set(key, html)

      res.send(html)
    })
    .catch((err) => {
      app.renderError(err, req, res, pagePath, queryParams)
    })
}

//"dev": "cross-env PORT=3003 node src/express.js",
//  "build": "next build",
//  "start": "cross-env NODE_ENV=production node src/express.js",
