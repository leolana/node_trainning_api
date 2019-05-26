// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';

const credenciamentoAprovacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const credenciamentoAprovacao = sequelize.define(
    'credenciamentoAprovacao',
    {
      credenciamentoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(credenciamentoStatusEnum)]
        }
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      observacao: {
        type: dataTypes.STRING(1000),
        allowNull: false
      }
    }
  );

  return credenciamentoAprovacao;
};

export default credenciamentoAprovacaoModel;
