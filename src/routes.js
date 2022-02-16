//eslint-disable-next-line @typescript-eslint/no-var-requires
const routes = require('next-routes')

const appRouter = new routes()

appRouter.add('catalog', '/:catalog/:page?', 'catalog')
//appRouter.add('catalog', '/:catalogue/', 'catalogue')

module.exports = appRouter
