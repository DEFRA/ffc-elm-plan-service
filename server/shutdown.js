const messageService = require('./services/message-service')

async function shutdown (reason) {
  console.info(`Shutting down. Reason: ${reason}`)

  await messageService.closeConnections()

  process.exit(0)
}

module.exports = shutdown
