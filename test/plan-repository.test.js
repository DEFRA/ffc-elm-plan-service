let planRepository
let MockSequelize
let mockDb

describe('Test plan repository', () => {
  beforeAll(async () => {
    jest.mock('../server/models')
    jest.mock('../server/models/plan', () => {
      MockSequelize = require('sequelize-mock')
      mockDb = new MockSequelize()
      return mockDb.define('plans', {
        planId: 'PLAN123'
      })
    })
    planRepository = require('../server/repository/plan-repository')
  })

  test('Plan repository loads object from database', async () => {
    // You have to push a query result into a queue, as the mock db doesn't keep track.
    // Anything you push into the results queue is returned by the next query
    mockDb.$queueResult({
      planId: 'PLAN123'
    })
    const plan = await planRepository.getById('PLAN123')
    await expect(plan.planId).toEqual('PLAN123')
  })

  test('Plan repository creates object in database', async () => {
    mockDb.$queueResult({
      planId: 'PLAN123'
    })
    const plan = await planRepository.create({
      planId: 'PLAN123'
    })
    await expect(plan.planId).toEqual('PLAN123')
  })

  test('Plan repository handles database failure', async () => {
    mockDb.$queueFailure(new MockSequelize.ValidationError('Test error'))

    await expect(planRepository.getById('PLAN123')).rejects.toThrow()
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    jest.unmock('../server/models/plan')
    jest.unmock('../server/models')
  })
})
