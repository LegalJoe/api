'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subjectOne: {
        type: Sequelize.STRING
      },
      subjectTwo: {
        type: Sequelize.STRING
      },
      textPaid: {
        type: Sequelize.STRING
      },
      textFree: {
        type: Sequelize.STRING
      },
      textChecked: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Emails');
  }
};