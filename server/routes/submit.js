const schema = require('../schema/plan')
const planService = require('../services/plan-service')

module.exports = {
  method: 'POST',
  path: '/submit',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        console.log(`rejected payload ${request.payload}`)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      console.log('new plan received')
      const plan = await planService.create(request.payload)
      return h.response(plan).code(200)
    }
  }
}
