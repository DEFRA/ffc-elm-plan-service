describe('GET /healthy', () => {
  const planEventSender = {}
  let createServer
  let databaseService
  let messageService
  let server

  beforeAll(async () => {
    jest.mock('../../server/services/database-service')
    jest.mock('../../server/services/message-service')

    databaseService = require('../../server/services/database-service')
    messageService = require('../../server/services/message-service')

    messageService.getplanEventSender = jest.fn().mockReturnValue(planEventSender)

    planEventSender.isConnected = jest.fn().mockReturnValue(false)

    createServer = require('../../server')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    databaseService.isConnected = jest.fn().mockReturnValue(true)
    planEventSender.isConnected = jest.fn().mockReturnValue(true)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  test('returns 500 if database not connected', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    databaseService.isConnected = jest.fn().mockReturnValue(false)
    planEventSender.isConnected = jest.fn().mockReturnValue(true)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(503)
    expect(response.payload).toBe('database unavailable')
  })

  test('returns 503 if plan queue not connected', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    databaseService.isConnected = jest.fn().mockReturnValue(true)
    planEventSender.isConnected = jest.fn().mockReturnValue(false)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.payload).toBe('ok')
  })

  test('returns 503 with appropriate message if all downstream services are disconnected', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    databaseService.isConnected = jest.fn().mockReturnValue(false)
    planEventSender.isConnected = jest.fn().mockReturnValue(false)

    const response = await server.inject(options)

    expect(response.statusCode).toBe(503)
    expect(response.payload).toBe('database unavailable')
  })

  afterEach(async () => {
    await server.stop()
  })
})
