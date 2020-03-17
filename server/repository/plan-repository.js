const db = require('../models')

module.exports = {
  getById: async function (planId) {
    return db.plans.findOne({
      where: {
        planId: planId
      }
    })
  },
  create: async function (plan) {
    return db.plans.upsert({
      planId: plan.planId
    })
  }
}
