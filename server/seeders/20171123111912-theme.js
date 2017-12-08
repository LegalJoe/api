'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Themes', [{
      primaryOne: '#6fc2be',
      primaryTwo: '#FFC107',
      error: '#FFC107',
      title: '#060c36',
      titleTwo: '#060c36',
      subtitle: '#060c36',
      subtitleTwo: '#060c36',
      textColor: '#060c36',
      textTwo: '#060c36',
      canvas: '#FFFFFF',
      border: '#DEDEDE',
      disabled: 'rgba(222, 222, 222, 0.7)',
      fontTitle: 'Roboto Slab, serif',
      fontSubtitle: 'Lato, sans-serif',
      fontText: 'Lato, sans-serif',
      createdAt: Sequelize.fn('NOW'),
      updatedAt: Sequelize.fn('NOW')
    }], {});
 },

 down: (queryInterface, Sequelize) => {
  return queryInterface.bulkDelete('Themes', null, {})
 }
};
