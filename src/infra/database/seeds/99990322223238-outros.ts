import { QueryInterface } from 'sequelize';

module.exports = {
  // tslint:disable-next-line:no-empty
  up: async (queryInterface: QueryInterface) => { },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('antecipacaoRecebivel', null, {});
    await queryInterface.bulkDelete('antecipacao', null, {});
    return queryInterface.bulkDelete('usuarioSolicitacaoSenha', null, {});
  },
};
