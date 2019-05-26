import { Sequelize, DataTypes } from 'sequelize-database';

import recusaTipoEnum from '../../../domain/entities/recusaTipoEnum';

const motivoTipoRecusaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const motivoTipoRecusa = sequelize.define(
    'motivoTipoRecusa',
    {
      motivoRecusaId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      recusaTipoId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(recusaTipoEnum)],
        }
      },
    }
  );

  motivoTipoRecusa.associate = (models) => {
    const { motivoRecusa, participanteIndicacao, participanteVinculo } = models;

    motivoTipoRecusa.hasMany(participanteIndicacao, { as: 'motivosTipoRecusa', foreignKey: 'motivoTipoRecusaId' });
    motivoTipoRecusa.hasMany(participanteVinculo, { as: 'participanteVinculos', foreignKey: 'motivoTipoRecusaId' });
    motivoTipoRecusa.belongsTo(motivoRecusa, { foreignKey: 'motivoRecusaId' });
  };

  return motivoTipoRecusa;
};

export default motivoTipoRecusaModel;
