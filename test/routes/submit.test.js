describe('Web test', () => {
  const createServer = require('../../server')
  const mockMessageService = require('../../server/services/message-service')
  const mockPlanRepository = require('../../server/repository/plan-repository')

  jest.mock('../../server/repository/plan-repository')
  jest.mock('../../server/services/message-service')

  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
    jest.resetAllMocks()
  })

  afterAll(async () => {
    jest.unmock('../../server/repository/plan-repository')
    jest.unmock('../../server/services/message-service')
  })

  test('POST /submit route works with valid content', async () => {
    const options = {
      method: 'POST',
      url: '/submit',
      payload: {
        planId: 'PLAN123'
      }
    }

    const response = await server.inject(options)
    expect(mockPlanRepository.create).toHaveBeenCalledTimes(1)
    expect(mockMessageService.publishPlan).toHaveBeenCalledTimes(1)
    expect(response.statusCode).toBe(200)
  })

  test('POST /submit route fails with invalid content', async () => {
    const options = {
      method: 'POST',
      url: '/submit',
      payload: {}
    }

    const response = await server.inject(options)
    expect(mockPlanRepository.create).toHaveBeenCalledTimes(0)
    expect(mockMessageService.publishPlan).toHaveBeenCalledTimes(0)
    expect(response.statusCode).toBe(400)
  })
})
