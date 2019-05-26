// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import cessaoStatus from '../../../domain/entities/cessaoStatus';
import cessaoTipo from '../../../domain/entities/cessaoTipo';
import cessaoDiluicaoPagamento from '../../../domain/entities/cessaoDiluicaoPagamento';

const cessaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const cessao = sequelize.define(
    'cessao',
    {
      participanteVinculoId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      solicitante: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: cessaoStatus.aguardandoAprovacao,
        validate: {
          isIn: [<any[]>Object.values(cessaoStatus)],
        }
      },
      valorSolicitado: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      valorDisponivel: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      dataVencimento: {
        type: dataTypes.DATEONLY,
        allowNull: false,
      },
      dataExpiracao: {
        type: dataTypes.DATEONLY,
        allowNull: false,
      },
      codigoCessao: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      referencia: {
        type: dataTypes.STRING(30),
        allowNull: true,
      },
      codigoRetornoSiscof: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      mensagemRetornoSiscof: {
        type: dataTypes.STRING(500),
        allowNull: true,
      },
      taxaCessao: {
        type: dataTypes.FLOAT,
        allowNull: true,
      },
      fornecedorAceiteTermoId: {
        type: dataTypes.INTEGER,
        allowNull: true, // temporario
      },
      estabelecimentoAceiteTermoId: {
        type: dataTypes.INTEGER,
        allowNull: true, // temporario
      },
      dataRespostaEstabelecimento: {
        type: dataTypes.DATE,
        allowNull: true,
      },
      usuarioRespostaEstabelecimento: {
        type: dataTypes.STRING(100),
        allowNull: true,
      },
      numeroParcelas: {
        type: dataTypes.SMALLINT,
        allowNull: true,
      },
      tipo: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: cessaoTipo.cessao,
        validate: {
          isIn: [<any[]>Object.values(cessaoTipo)]
        }
      },
      diluicaoPagamento: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: cessaoDiluicaoPagamento.diaVencimento,
        validate: {
          isIn: [<any[]>Object.values(cessaoDiluicaoPagamento)]
        }
      },
    }
  );

  cessao.associate = (models) => {
    const { participanteAceiteTermo, cessaoAceite, cessaoRecebivel } = models;

    cessao.belongsTo(
      participanteAceiteTermo, { as: 'estabelecimentoAceiteTermo', foreignKey: { allowNull: false } }
    );

    cessao.hasMany(cessaoAceite, { as: 'aceites', foreignKey: 'cessaoId' });
    cessao.hasMany(cessaoRecebivel, { as: 'recebiveis', foreignKey: 'cessaoId' });
  };

  return cessao;
};

export default cessaoModel;
