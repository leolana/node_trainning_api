// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';

const participanteVinculoRecorrenteModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteVinculoRecorrente = sequelize.define(
    'participanteVinculoRecorrente',
    {
      participanteVinculoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: participanteVinculoStatus.pendente,
        validate: {
          isIn: [<any[]>Object.values(participanteVinculoStatus)],
        }
      },
      valorMaximo: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      dataFinalVigencia: {
        type: dataTypes.DATEONLY,
        allowNull: false
      },
      usuarioAprovadorEstabelecimento: {
        type: dataTypes.STRING(100),
        allowNull: true
      },
      dataAprovacaoEstabelecimento: {
        type: dataTypes.DATE,
        allowNull: true
      }
    }
  );

  return participanteVinculoRecorrente;
};

export default participanteVinculoRecorrenteModel;
