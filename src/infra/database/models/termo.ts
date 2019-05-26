// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import termoTipo from '../../../domain/entities/termoTipo';

const termoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const termo = sequelize.define(
    'termo',
    {
      titulo: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      tipo: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(termoTipo)]
        }
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      texto: {
        type: dataTypes.TEXT,
        allowNull: false
      },
      inicio: {
        type: dataTypes.DATEONLY,
        allowNull: false,
      },
      fim: {
        type: dataTypes.DATEONLY,
        allowNull: true,
      }
    }
  );

  termo.associate = (models) => {
    const { participanteAceiteTermo } = models;

    termo.hasMany(participanteAceiteTermo, { as: 'aceites', foreignKey: 'termoId' });
  };

  return termo;
};

export default termoModel;
