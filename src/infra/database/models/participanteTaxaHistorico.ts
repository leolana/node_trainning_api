// tslint:disable:no-magic-numbers
// tslint:disable:no-invalid-this
import { Sequelize, DataTypes } from 'sequelize-database';

import rateTypeEnum from '../../../domain/services/types/rateTypeEnum';

const participanteTaxaHistoricoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteTaxaHistorico = sequelize.define(
    'participanteTaxaHistorico',
    {
      participanteTaxaId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
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
      dataInclusao: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      participanteTaxaTipo: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [Object.values(rateTypeEnum)]
        }
      },
    },
  );

  participanteTaxaHistorico.associate = (models) => {
    const { participante, participanteTaxa } = models;

    participanteTaxaHistorico.belongsTo(
      participante,
      { constraints: false }
    );
    participanteTaxaHistorico.belongsTo(
      participanteTaxa,
      { constraints: false }
    );
  };

  return participanteTaxaHistorico;
};

export default participanteTaxaHistoricoModel;
