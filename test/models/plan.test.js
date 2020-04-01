describe('Test Plan model', () => {
  test('plan model is created', async () => {
    jest.mock('sequelize', () => {
      const mockSequelize = require('sequelize-mock')
      return mockSequelize
    })

    const planModel = require('../../server/models/plan')

    expect(planModel.name).toEqual('')
  })
})
