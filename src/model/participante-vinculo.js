const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide('@participante-vinculo.entities', '@@participante-vinculo-status',
    status => Promise.resolve({
      identity: 'participanteVinculo',
      attributes: {
        participanteEstabelecimentoId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        participanteFornecedorId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        usuario: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        status: {
          type: Sequelize.SMALLINT,
          allowNull: false,
          isIn: [Object.values(status)],
          defaultValue: status.aguardandoAprovacao,
        },
        exibeValorDisponivel: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        diasAprovacao: {
          type: Sequelize.SMALLINT,
          allowNull: false,
        },
        dataRespostaEstabelecimento: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        usuarioRespostaEstabelecimento: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        estabelecimentoSolicitouVinculo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        valorMaximoExibicao: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        motivoTipoRecusaId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        motivoRecusaObservacao: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
      },
      associations: {
        hasMany: {
          cessao: {
            as: 'cessoes',
            foreignKey: 'participanteVinculoId',
          },
          participanteVinculoRecorrente: {
            as: 'recorrentes',
            foreignKey: 'participanteVinculoId',
          },
        },
        belongsTo: {
          participanteFornecedor: {
            as: 'fornecedor',
            sourceKey: 'participanteFornecedorId',
            foreignKey: 'participanteFornecedorId',
          },
          participanteEstabelecimento: {
            as: 'estabelecimento',
            sourceKey: 'participanteEstabelecimentoId',
            foreignKey: 'participanteEstabelecimentoId',
          },
          motivoTipoRecusa: {
            as: 'recusa',
            sourceKey: 'motivoTipoRecusaId',
            foreignKey: 'motivoTipoRecusaId',
          },
        },
      },
    }));
};
