// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteDomicilioBancarioModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const participanteDomicilioBancario = sequelize.define(
    'participanteDomicilioBancario',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      bandeiraId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      bancoId: {
        type: dataTypes.STRING(3),
        allowNull: false
      },
      bancoNome: {
        type: dataTypes.STRING(50),
        allowNull: false
      },
      agencia: {
        type: dataTypes.STRING(5),
        allowNull: false
      },
      conta: {
        type: dataTypes.STRING(10),
        allowNull: false
      },
      digito: {
        type: dataTypes.STRING(1),
        allowNull: false
      },
      arquivo: {
        type: dataTypes.STRING(200),
        allowNull: true
      }
    }
  );

  participanteDomicilioBancario.associate = (models) => {
    const { bandeira } = models;

    participanteDomicilioBancario.belongsTo(bandeira, { foreignKey: 'bandeiraId' });
  };

  return participanteDomicilioBancario;
};

export default participanteDomicilioBancarioModel;
