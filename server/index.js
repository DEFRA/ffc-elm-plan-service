const hapi = require('@hapi/hapi')

const config = require('./config')
const messageService = require('./services/message-service')
const shutdown = require('./shutdown')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  if (config.isDev) {
    await server.register(require('blipp'))
    await server.register(require('./plugins/logging'))
  }

  process.on('SIGINT', shutdown.bind(this, 'received SIGINT.'))
  process.on('SIGTERM', shutdown.bind(this, 'received SIGTERM.'))

  await messageService.createQueuesIfRequired()
  return server
}

module.exports = createServer
