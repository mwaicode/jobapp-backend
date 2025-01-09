const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// Define the Applicant model
const Applicant = sequelize.define('Applicant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true
  },
  application_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'applicants'  // This will name the table "applicants"
});

module.exports = Applicant;
