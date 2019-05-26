// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import cessaoRecebivelStatus from '../../../domain/entities/cessaoRecebivelStatus';

const cessaoHistoricoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const cessaoHistorico = sequelize.define(
    'cessaoHistorico',
    {
      cessaoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      participanteVinculoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      solicitante: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: cessaoRecebivelStatus.pagamentoPendente,
        validate: {
          isIn: [<any[]>Object.values(cessaoRecebivelStatus)],
        },
      },
      valorSolicitado: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      valorDisponivel: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      dataVencimento : {
        type : dataTypes.DATEONLY,
        allowNull : false,
      },
      dataExpiracao : {
        type : dataTypes.DATEONLY,
        allowNull: false,
      },
      codigoCessao : {
        type: dataTypes.INTEGER,
        allowNull : true
      },
      referencia : {
        type: dataTypes.STRING(30),
        allowNull: true
      },
      codigoRetornoSiscof : {
        type: dataTypes.INTEGER,
        allowNull: true
      },
      mensagemRetornoSiscof : {
        type: dataTypes.STRING(500),
        allowNull: true
      },
      taxaCessao: {
        type: dataTypes.FLOAT,
        allowNull: true,
      },
      fornecedorAceiteTermoId: {
        type: dataTypes.INTEGER,
        allowNull: true // temporario
      },
      estabelecimentoAceiteTermoId: {
        type: dataTypes.INTEGER,
        allowNull: true // temporario
      },
      dataRespostaEstabelecimento:{
        type: dataTypes.DATE,
        allowNull: true
      },
      usuarioRespostaEstabelecimento: {
        type: dataTypes.STRING(100),
        allowNull: true
      },
      numeroParcelas: {
        type: dataTypes.SMALLINT,
        allowNull: true
      },
    }
  );

  cessaoHistorico.associate = (models) => {
    const { cessao } = models;

    cessaoHistorico.belongsTo(cessao, { foreignKey: 'cessaoId' });
  };

  return cessaoHistorico;
};

export default cessaoHistoricoModel;
