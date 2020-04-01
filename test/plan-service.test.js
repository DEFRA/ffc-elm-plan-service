
describe('Test plan service', () => {
  let planService
  let mockPlanRepository
  let mockMessageService

  beforeAll(async () => {
    jest.mock('../server/repository/plan-repository')
    jest.mock('../server/services/message-service')
  })

  beforeEach(async () => {
    jest.resetModules()
    mockPlanRepository = require('../server/repository/plan-repository')
    mockMessageService = require('../server/services/message-service')
    planService = require('../server/services/plan-service')
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  test('Plan service create works with new plan', async () => {
    const planRecord = {
      planId: 'PLAN123'
    }
    await planService.create(planRecord)
    expect(mockPlanRepository.create).toHaveBeenCalledTimes(1)
    expect(mockPlanRepository.create).lastCalledWith(planRecord)
  })

  test('Plan service create works with existing plan', async () => {
    mockPlanRepository.getById.mockResolvedValue({})
    const planRecord = {
      planId: 'PLAN123'
    }
    await planService.create(planRecord)
    expect(mockPlanRepository.create).toHaveBeenCalledTimes(0)
  })

  test('Plan service publishes the plan to the message broker', async () => {
    const planRecord = {
      planId: 'PLAN123'
    }
    await planService.create(planRecord)
    expect(mockMessageService.publishPlan).toHaveBeenCalledTimes(1)
  })

  afterAll(async () => {
    jest.unmock('../server/repository/plan-repository')
    jest.unmock('../server/services/message-service')
  })
})
