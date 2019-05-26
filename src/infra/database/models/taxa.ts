// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import tiposPessoa from '../../../domain/entities/tiposPessoa';

const taxaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const taxa = sequelize.define(
    'taxa',
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
      default: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  taxa.associate = (models) => {
    const { ramoAtividade, taxaBandeira, taxaPrazo } = models;

    taxa.belongsTo(ramoAtividade, { foreignKey: 'ramoAtividadeCodigo' });

    taxa.hasMany(taxaBandeira, { as: 'bandeiras', foreignKey: 'taxaId' });
    taxa.hasMany(taxaPrazo, { as: 'prazos', foreignKey: 'taxaId' });
  };

  return taxa;
};

export default taxaModel;
