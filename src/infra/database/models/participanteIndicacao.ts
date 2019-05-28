// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import personTypeEnum from '../../../domain/services/types/personTypeEnum';

const participanteIndicacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteIndicacao = sequelize.define(
    'participanteIndicacao',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      tipoPessoa: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [Object.values(personTypeEnum)],
        }
      },
      documento: {
        type: dataTypes.STRING(18),
        allowNull: false,
      },
      nome: {
        type: dataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: dataTypes.STRING(200),
        allowNull: true,
      },
      telefone: {
        type: dataTypes.STRING(11),
        allowNull: true,
      },
      canalEntrada: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [Object.values(participateNominationSourceEnum)]
        }
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: participanteIndicacaoStatus.pendente,
        validate: {
          isIn: [Object.values(participanteIndicacaoStatus)]
        }
      },
      usuarioResposta: {
        type: dataTypes.STRING(100),
        allowNull: true,
      },
      motivo: {
        type: dataTypes.STRING(500),
        allowNull: true,
      },
      motivoTipoRecusaId: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      dataFimIndicacao: {
        type: dataTypes.DATE,
        allowNull: true,
      },
    }
  );

  participanteIndicacao.associate = (models) => {
    const { participante, motivoTipoRecusa } = models;

    participanteIndicacao.belongsTo(participante, { foreignKey: 'participanteId' });
    participanteIndicacao.belongsTo(motivoTipoRecusa, { foreignKey: 'motivoTipoRecusaId' });
  };

  return participanteIndicacao;
};

export default participanteIndicacaoModel;
