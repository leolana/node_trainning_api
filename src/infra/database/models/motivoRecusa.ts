// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const motivoRecusaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const motivoRecusa = sequelize.define(
    'motivoRecusa',
    {
      codigo: {
        type: dataTypes.STRING(20),
      },
      descricao: {
        type: dataTypes.STRING(100),
      },
      requerObservacao: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    }
  );

  motivoRecusa.associate = (models) => {
    const { motivoTipoRecusa } = models;

    motivoRecusa.hasMany(motivoTipoRecusa, { as: 'tiposRecusa', foreignKey: 'motivoRecusaId' });
  };

  return motivoRecusa;
};

export default motivoRecusaModel;
