const joi = require('@hapi/joi')

const mqSchema = joi.object({
  planQueue: {
    name: joi.string().default('plan'),
    endpoint: joi.string().default('http://localhost:9324'),
    queueUrl: joi.string().default('http://localhost:9324/queue/plan'),
    region: joi.string().default('eu-west-2'),
    accessKeyId: joi.string().optional(),
    secretAccessKey: joi.string().optional(),
    createQueue: joi.bool().default(false)
  }
})

const mqConfig = {
  planQueueConfig: {
    name: process.env.PLAN_QUEUE_NAME,
    endpoint: process.env.PLAN_QUEUE_ENDPOINT,
    queueUrl: process.env.PLAN_QUEUE_URLL || `${process.env.PLAN_QUEUE_ENDPOINT}/${process.env.PLAN_QUEUE_NAME}`,
    region: process.env.PLAN_QUEUE_REGION,
    accessKeyId: process.env.PLAN_QUEUE_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.PLAN_QUEUE_DEV_ACCESS_KEY,
    createQueue: process.env.PLAN_QUEUE_CREATE
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

module.exports = {
  planQueueConfig: { ...mqResult.value.planQueueConfig }
}
