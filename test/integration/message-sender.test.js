const MessageSender = require('../../server/services/messaging/message-sender')
const createQueue = require('../../server/services/messaging/create-queue')
const purgeQueue = require('../../server/services/messaging/purge-queue')

const config = require('../../server/config')
const queueName = 'testq1'
const queueUrl = `${config.planQueueConfig.endpoint}/queue/${queueName}`

beforeAll(async () => {
  await createQueue(queueName, config.planQueueConfig)
})

afterAll(async () => {
  await purgeQueue(queueUrl, config.planQueueConfig)
})

describe('send message', () => {
  test('sends a json message', async () => {
    jest.setTimeout(30000)
    const sender = new MessageSender(config.planQueueConfig, queueUrl)
    const result = await sender.sendMessage({ greeting: 'test message' })
    console.log(result)
    expect(result).toBeDefined()
  })
})
