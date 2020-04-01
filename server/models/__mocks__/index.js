const db = {}

const Sequelize = require('sequelize')

jest.mock('sequelize', () => {
  const mockSequelize = require('sequelize-mock')
  return mockSequelize
})

const sequelize = new Sequelize()
const plan = require('../plan')

db.sequelize = sequelize
db.Sequelize = Sequelize
db[plan.name] = plan

module.exports = db
