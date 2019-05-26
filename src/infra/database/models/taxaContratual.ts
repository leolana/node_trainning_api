// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import tiposPessoa from '../../../domain/entities/tiposPessoa';

const taxaContratualModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const taxaContratual = sequelize.define(
    'taxaContratual',
    {
      tipoPessoa: {
        type: dataTypes.SMALLINT,
        validate: {
          isIn: [<any[]>Object.values(tiposPessoa)]
        }
      },
      inicio: {
        type: dataTypes.DATEONLY,
        allowNull: false
      },
      fim: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      antecipacao: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      adesao: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      maximoParcelas: {
        type: dataTypes.SMALLINT,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  taxaContratual.associate = (models) => {
    const { ramoAtividade } = models;

    taxaContratual.belongsTo(ramoAtividade, { foreignKey: 'ramoAtividadeCodigo' });
  };

  return taxaContratual;
};

export default taxaContratualModel;
