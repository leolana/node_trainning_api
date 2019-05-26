// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import cessaoRecebivelStatus from '../../../domain/entities/cessaoRecebivelStatus';

const cessaoRecebivelModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const cessaoRecebivel = sequelize.define(
    'cessaoRecebivel',
    {
      cessaoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      eventoId: {
        type: dataTypes.INTEGER,
        allowNull: true
      },
      dataVenda: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      valorVenda: {
        type: dataTypes.FLOAT,
        allowNull: true
      },
      dataReserva: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      dataPagarEc: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      valorPagarEc: {
        type: dataTypes.FLOAT,
        allowNull: true
      },
      nsu: {
        type: dataTypes.STRING(30),
        allowNull: true
      },
      numeroParcela: {
        type: dataTypes.SMALLINT,
        allowNull: true
      },
      totalParcelas: {
        type: dataTypes.SMALLINT,
        allowNull: true
      },
      statusPagamento: {
        type: dataTypes.SMALLINT,
        allowNull: true,
        defaultValue: cessaoRecebivelStatus.pagamentoPendente,
        validate: {
          isIn: [<any[]>Object.values(cessaoRecebivelStatus)]
        }
      }
    }
  );

  cessaoRecebivel.associate = (models) => {
    const { evento } = models;

    cessaoRecebivel.belongsTo(evento, { foreignKey: 'eventoId' });
  };

  return cessaoRecebivel;
};

export default cessaoRecebivelModel;
