'use strict'
module.exports = (sequelize, DataTypes) => {
  const schema = {
    planId: { type: DataTypes.STRING, primaryKey: true }
  }

  const options = {
    freezeTableName: true,
    tableName: 'plans'
  }

  const Plan = sequelize.define('plans', schema, options)

  Plan.associate = function (models) {
    // associations can be defined here
  }

  return Plan
}
