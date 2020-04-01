const joi = require('@hapi/joi')

const mqSchema = joi.object({

  planCommandQueue: {
    name: joi.string().default('plan'),
    endpoint: joi.string().default('http://localhost:9324'),
    queueUrl: joi.string().default('http://localhost:9324/queue/plan'),
    region: joi.string().default('eu-west-2'),
    accessKeyId: joi.string(),
    secretAccessKey: joi.string(),
    createQueue: joi.bool().default(true)
  }
})

const mqConfig = {
  planCommandQueue: {
    name: process.env.PLAN_QUEUE_NAME,
    endpoint: process.env.PLAN_ENDPOINT,
    queueUrl: process.env.PLAN_QUEUE_URL,
    region: process.env.PLAN_QUEUE_REGION,
    accessKeyId: process.env.PLAN_QUEUE_ACCESS_KEY_ID,
    secretAccessKey: process.env.PLAN_QUEUE_ACCESS_KEY,
    createQueue: process.env.CREATE_PLAN_QUEUE
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const planCommandQueueConfig = { ...mqResult.value.messageQueue, ...mqResult.value.planCommandQueue }

module.exports = {
  planCommandQueueConfig: planCommandQueueConfig
}
