// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import cessaoStatus from '../../../domain/entities/cessaoStatus';

const cessaoAceiteModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const cessaoAceite = sequelize.define(
    'cessaoAceite',
    {
      cessaoId: {
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
        defaultValue: cessaoStatus.aguardandoAprovacao,
        validate: {
          isIn: [<any[]>Object.values(cessaoStatus)]
        }
      },
      termoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      mensagemSiscof: {
        type: dataTypes.STRING(500),
        allowNull: true
      },
      codRetornoSiscof: {
        type: dataTypes.INTEGER,
        allowNull: true
      }
    }
  );

  cessaoAceite.associate = (models) => {
    const { termo } = models;

    cessaoAceite.belongsTo(termo, { foreignKey: 'termoId' });
  };

  return cessaoAceite;
};

export default cessaoAceiteModel;
