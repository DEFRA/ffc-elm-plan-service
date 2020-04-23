const createQueue = require('./messaging/create-queue')
const MessageSender = require('./messaging/message-sender')
const config = require('../config')

const planEventSender = new MessageSender(config.planEventQueueConfig, config.planEventQueueConfig.queueUrl)

async function createQueuesIfRequired () {
  if (config.planEventQueueConfig.createQueue) {
    await createQueue(config.planEventQueueConfig.name, config.planEventQueueConfig)
  }
}

async function publishPlan (plan) {
  try {
    await Promise.all([
      planEventSender.sendMessage(plan)
    ])
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  publishPlan,
  createQueuesIfRequired
}
