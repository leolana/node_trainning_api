// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteAceiteTermoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const participanteAceiteTermo = sequelize.define(
    'participanteAceiteTermo',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      termoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
    }
  );

  participanteAceiteTermo.associate = (models) => {
    const { participante, termo } = models;

    participanteAceiteTermo.belongsTo(participante, { foreignKey: 'participanteId' });
    participanteAceiteTermo.belongsTo(termo, { foreignKey: 'termoId' });
  };

  return participanteAceiteTermo;
};

export default participanteAceiteTermoModel;
