const createQueue = require('./messaging/create-queue')
const MessageSender = require('./messaging/message-sender')
const config = require('../config')

const planSender = new MessageSender(config.planQueueConfig, config.planQueueConfig.queueUrl)

async function createQueuesIfRequired () {
  if (config.planQueueConfig.createQueue) {
    await createQueue(config.planQueueConfig.name, config.planQueueConfig)
  }
}

async function publishPlan (plan) {
  try {
    await Promise.all([
      planSender.sendMessage(plan)
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
