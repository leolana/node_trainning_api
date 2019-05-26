const Sequelize = require('sequelize');

const canaisEntrada = require('../service/participante/nominationSource.enum');
const tiposPessoa = require('../service/participante/personType.enum');

module.exports = (di) => {
  di.provide(
    '@participante-indicacao.entities',
    '@@participante-indicacao-status',
    status => Promise.resolve({
      identity: 'participanteIndicacao',
      attributes: {
        participanteId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tipoPessoa: {
          type: Sequelize.INTEGER,
          isIn: Object.values(tiposPessoa),
          allowNull: false,
        },
        documento: {
          type: Sequelize.STRING(18),
          allowNull: false,
        },
        nome: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        telefone: {
          type: Sequelize.STRING(11),
          allowNull: true,
        },
        canalEntrada: {
          type: Sequelize.INTEGER,
          allowNull: false,
          isIn: Object.values(canaisEntrada),
        },
        usuario: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        status: {
          type: Sequelize.SMALLINT,
          allowNull: false,
          isIn: Object.values(status),
          defaultValue: status.pendente,
        },
        usuarioResposta: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        motivo: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        motivoTipoRecusaId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        dataFimIndicacao: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      associations: {
        belongsTo: {
          participante: { sourceKey: 'participanteId' },
          motivoTipoRecusa: { sourceKey: 'motivoTipoRecusaId' },
        },
      },
    })
  );
};
