const hapi = require('@hapi/hapi')

const config = require('./config')
const messageService = require('./services/message-service')
const shutdown = require('./shutdown')

async function createServer () {
  console.info('Creating server.')
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

  console.info('Registering plugins.')
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  if (config.isDev) {
    await server.register(require('blipp'))
    await server.register(require('./plugins/logging'))
  }

  console.info('Registering signal handlers.')
  process.on('SIGINT', shutdown.bind(this, 'received SIGINT.'))
  process.on('SIGTERM', shutdown.bind(this, 'received SIGTERM.'))

  console.info('Creating any required message queues.')
  await messageService.createQueuesIfRequired()

  console.info('Server is ready.')
  return server
}

module.exports = createServer
