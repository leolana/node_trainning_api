// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import ParticipanteIntegracaoTipo from '../../../domain/entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../../domain/entities/ParticipanteIntegracaoStatus';

const participanteIntegracaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteIntegracao = sequelize.define(
    'participanteIntegracao',
    {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        unique: 'uk_integracao'
      },
      tipoIntegracao: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [Object.values(ParticipanteIntegracaoTipo)]
        },
        unique: 'uk_integracao'
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [Object.values(ParticipanteIntegracaoStatus)]
        }
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
    }
  );

  return participanteIntegracao;
};

export default participanteIntegracaoModel;
