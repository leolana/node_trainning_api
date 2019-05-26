// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import tiposPessoa from '../../../domain/entities/tiposPessoa';

const participanteHistoricoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteHistorico = sequelize.define(
    'participanteHistorico',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      tipoPessoa: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(tiposPessoa)]
        }
      },
      ramoAtividadeCodigo: {
        type: dataTypes.INTEGER,
        allowNull: true
      },
      documento: {
        type: dataTypes.STRING(18),
        allowNull: false
      },
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      aberturaNascimento: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      telefone: {
        type: dataTypes.STRING(10),
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
      razaoSocial: {
        type: dataTypes.STRING(100)
      },
      inscricaoEstadual: {
        type: dataTypes.STRING(15)
      },
      inscricaoMunicipal: {
        type: dataTypes.STRING(15)
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      arquivos: {
        type: dataTypes.JSONB,
      }
    }
  );

  return participanteHistorico;
};

export default participanteHistoricoModel;
