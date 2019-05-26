// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import credenciamentoInstalacaoHorarios from '../../../domain/entities/credenciamentoInstalacaoHorarios';

const credenciamentoInstalacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const credenciamentoInstalacao = sequelize.define(
    'credenciamentoInstalacao',
    {
      credenciamentoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      cep: {
        type: dataTypes.STRING(8),
        allowNull: false
      },
      logradouro: {
        type: dataTypes.STRING(200),
        allowNull: false
      },
      numero: {
        type: dataTypes.STRING(15),
        allowNull: false
      },
      complemento: {
        type: dataTypes.STRING(50)
      },
      bairro: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      cidadeId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      pontoReferencia: {
        type: dataTypes.STRING(100)
      },
      dias: {
        type: dataTypes.SMALLINT,
        allowNull: false
      },
      horario: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(credenciamentoInstalacaoHorarios)]
        }
      },
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: dataTypes.STRING(200),
        allowNull: false,
      },
      telefone: {
        type: dataTypes.STRING(11),
        allowNull: true,
      },
      celular: {
        type: dataTypes.STRING(11),
        allowNull: false,
      },
    }
  );

  credenciamentoInstalacao.associate = (models) => {
    const { cidade } = models;

    credenciamentoInstalacao.belongsTo(cidade, { foreignKey: 'cidadeId' });
  };

  return credenciamentoInstalacao;
};

export default credenciamentoInstalacaoModel;
