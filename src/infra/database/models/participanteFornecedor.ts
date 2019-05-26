// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteFornecedorModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const participanteFornecedor = sequelize.define(
    'participanteFornecedor',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        primaryKey: true
      },
    }
  );

  participanteFornecedor.associate = (models) => {
    const { participante, participanteVinculo } = models;

    participanteFornecedor.belongsTo(participante, { foreignKey: 'participanteId' });
    participanteFornecedor.hasMany(participanteVinculo, { as: 'vinculos', foreignKey: 'participanteFornecedorId' });
  };

  return participanteFornecedor;
};

export default participanteFornecedorModel;
