import { Sequelize, DataTypes } from 'sequelize-database';

const membroModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const membro = sequelize.define(
    'membro',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        primaryKey: true
      },
      usuarioId: {
        type: dataTypes.UUID,
        primaryKey: true
      }
    }
  );

  membro.associate = (models) => {
    const { participante, usuario } = models;

    membro.belongsTo(participante, { foreignKey: 'participanteId' });
    membro.belongsTo(usuario, { foreignKey: 'usuarioId' });
  };

  return membro;
};

export default membroModel;
