const createQueue = require('./messaging/create-queue')
const MessageSender = require('./messaging/message-sender')
const config = require('../config')

const planEventSender = new MessageSender(config.planEventQueueConfig, config.planEventQueueConfig.queueUrl)

async function createQueuesIfRequired () {
  if (config.planEventQueueConfig.createQueue) {
    console.info('Creating Plan Event queue.')
    try {
      await createQueue(config.planEventQueueConfig.name, config.planEventQueueConfig)
    } catch (error) {
      console.error(`Failed to create Plan Event queue. Error: ${error}`)
      throw error
    }
  }
}

async function publishPlan (plan) {
  try {
    await Promise.all([
      planEventSender.sendMessage(plan)
    ])
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function closeConnections () {
  // Nothing to do here as we have no consumers
}

module.exports = {
  closeConnections,
  createQueuesIfRequired,
  publishPlan
}
