const planRepository = require('../repository/plan-repository')
const messageService = require('./message-service')

module.exports = {
  create: async function (plan) {
    const existingPlan = await planRepository.getById(plan.planId)
    if (existingPlan != null) {
      console.log('Found existing plan ', existingPlan)
      return existingPlan
    }

    console.log('Creating new plan ', plan)
    const planRecord = await planRepository.create(plan)

    await messageService.publishPlan(plan)

    return planRecord
  }
}
