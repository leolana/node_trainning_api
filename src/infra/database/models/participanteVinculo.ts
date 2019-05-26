// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';

const participanteVinculoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteVinculo = sequelize.define(
    'participanteVinculo',
    {
      participanteEstabelecimentoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      participanteFornecedorId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: participanteVinculoStatus.pendente,
        validate: {
          isIn: [<any[]>Object.values(participanteVinculoStatus)]
        }
      },
      exibeValorDisponivel: {
        type: dataTypes.BOOLEAN,
        allowNull: false
      },
      diasAprovacao: {
        type: dataTypes.SMALLINT,
        allowNull: false,
      },
      dataRespostaEstabelecimento: {
        type: dataTypes.DATE,
        allowNull: true
      },
      usuarioRespostaEstabelecimento: {
        type: dataTypes.STRING(100),
        allowNull: true
      },
      estabelecimentoSolicitouVinculo: {
        type: dataTypes.BOOLEAN,
        allowNull: false
      },
      valorMaximoExibicao: {
        type: dataTypes.FLOAT,
        allowNull: true,
      },
      motivoTipoRecusaId: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      motivoRecusaObservacao: {
        type: dataTypes.STRING(500),
        allowNull: true,
      },
    }
  );

  participanteVinculo.associate = (models) => {
    const {
      cessao,
      participanteVinculoRecorrente,
      participanteFornecedor,
      participanteEstabelecimento,
      motivoTipoRecusa
    } = models;

    participanteVinculo.hasMany(cessao, { as: 'cessoes', foreignKey: 'participanteVinculoId' });
    participanteVinculo.hasMany(
      participanteVinculoRecorrente,
      { as: 'recorrentes', foreignKey: 'participanteVinculoId' }
    );

    participanteVinculo.belongsTo(
      participanteFornecedor,
      { as: 'fornecedor', targetKey: 'participanteId', foreignKey: 'participanteFornecedorId' }
    );
    participanteVinculo.belongsTo(
      participanteEstabelecimento,
      { as: 'estabelecimento', targetKey: 'participanteId', foreignKey: 'participanteEstabelecimentoId' }
    );

    participanteVinculo.belongsTo(
      motivoTipoRecusa,
      {
        as: 'recusa',
        foreignKey: 'motivoTipoRecusaId',
      }
    );
  };

  return participanteVinculo;
};

export default participanteVinculoModel;
