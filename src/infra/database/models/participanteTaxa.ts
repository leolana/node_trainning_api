// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import rateTypeEnum from '../../../domain/services/types/rateTypeEnum';

const participanteTaxaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteTaxa = sequelize.define(
    'participanteTaxa',
    {
      valorInicio: {
        type: dataTypes.NUMERIC(12, 2),
        allowNull: true,
      },
      valorFim: {
        type: dataTypes.NUMERIC(12, 2),
        allowNull: true,
      },
      taxa: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      usuarioCriacao: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      participanteTaxaTipo: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(rateTypeEnum)]
        }
      },
    }
  );

  participanteTaxa.associate = (models) => {
    const { participante, participanteTaxaHistorico } = models;

    participanteTaxa.belongsTo(participante, { foreignKey: 'participanteId' });

    participanteTaxa.hasMany(
      participanteTaxaHistorico,
      {
        as: 'taxasHistorico',
        foreignKey: 'participanteTaxaId',
        constraints: false,
      }
    );
  };

  return participanteTaxa;
};

export default participanteTaxaModel;
