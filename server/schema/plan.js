const Joi = require('@hapi/joi')

module.exports = Joi.object({
  planId: Joi.string().required()
})
