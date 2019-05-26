// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import antecipacaoStatus from '../../../domain/entities/antecipacaoStatus';

const antecipacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const antecipacao = sequelize.define(
    'antecipacao',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      dataPagamento: {
        type: dataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: antecipacaoStatus.solicitado,
        validate: {
          isIn: [<any[]>Object.values(antecipacaoStatus)]
        }
      },
    }
  );

  antecipacao.associate = (models) => {
    const { antecipacaoRecebivel } = models;

    antecipacao.hasMany(antecipacaoRecebivel, { as: 'recebiveisAntecipacao', foreignKey: 'antecipacaoId' });
  };

  return antecipacao;
};

export default antecipacaoModel;
