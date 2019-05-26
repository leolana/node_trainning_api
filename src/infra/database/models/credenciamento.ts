// tslint:disable:no-invalid-this
// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import validator from '../validator';
import tiposPessoa from '../../../domain/entities/tiposPessoa';
import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';
import { InvalidSentDataException } from '../../../interfaces/rest/exceptions/ApiExceptions';

export const credenciamentoArquivosSchemas: any = () => {
  const fichaCadastro = {
    type: 'string',
    max: 250,
    required: false
  };

  const extratosBancarios = {
    type: 'array',
    of: 'json',
    required: false
  };

  const analises = {
    type: 'array',
    of: 'json',
    attributes: {
      id: {
        type: 'integer',
      },
      arquivo: {
        type: 'string',
      },
      observacao: {
        type: 'string',
      },
      usuario: {
        type: 'string',
      },
      createdAt: {
        type: 'string',
      },
      updatedAt: {
        type: 'string',
      },
    },
    required: false,
    min: 0,
  };

  return {
    pessoaFisica: (proposta?: boolean) => {
      const schema: any = {
        analises,
        identidade: {
          type: 'string',
          max: 250,
          required: true
        },
        comprovanteDeResidencia: {
          type: 'string',
          max: 250,
          required: true
        },
      };

      if (proposta) {
        schema.fichaCadastro = fichaCadastro;
        schema.extratosBancarios = extratosBancarios;
      }

      return schema;
    },
    pessoaJuridica: (proposta?: boolean) => {
      const schema: any = {
        analises,
        contratoSocial: {
          type: 'string',
          max: 250,
          required: true
        },
      };

      if (proposta) {
        schema.fichaCadastro = fichaCadastro;
        schema.extratosBancarios = extratosBancarios;
      }

      return schema;
    }
  };
};

const credenciamentoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const schemas = credenciamentoArquivosSchemas();

  const credenciamento = sequelize.define(
    'credenciamento',
    {
      tipoPessoa: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(tiposPessoa)],
        },
      },
      ramoAtividadeCodigo: {
        type: dataTypes.INTEGER,
        allowNull: false
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
        allowNull: false
      },
      telefone: {
        type: dataTypes.STRING(11),
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
      faturamentoCartaoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      ticketMedioId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      ecommerce: {
        type: dataTypes.STRING(255)
      },
      taxaContratualId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      taxaAdesao: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      arquivos: {
        type: dataTypes.JSONB
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: credenciamentoStatusEnum.pendente,
        validate: {
          isIn: [<any[]>Object.values(credenciamentoStatusEnum)],
        },
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
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      validate: {
        verificarDadosPessoa() {
          if (+this.tipoPessoa === tiposPessoa.juridica) {
            if (!this.razaoSocial || !this.inscricaoEstadual || !this.inscricaoMunicipal) {
              throw new InvalidSentDataException();
            }
          }
        },
        verificarArquivos() {
          if (+this.tipoPessoa === tiposPessoa.fisica) {
            if (!validator.check(schemas.pessoaFisica(), this.arquivos)) {
              throw new InvalidSentDataException();
            }
          }

          if (+this.tipoPessoa === tiposPessoa.juridica) {
            if (!validator.check(schemas.pessoaJuridica(), this.arquivos)) {
              throw new InvalidSentDataException();
            }
          }
        }
      }
    }
  );

  credenciamento.associate = (models) => {
    const {
      cidade,
      faturamentoCartao,
      ramoAtividade,
      taxaContratual,
      ticketMedio,
      participante,
      credenciamentoAprovacao,
      credenciamentoCaptura,
      credenciamentoDomicilioBancario,
      credenciamentoTaxaAdministrativa,
      credenciamentoTaxaDebito,
      credenciamentoSocio,
      credenciamentoInstalacao,
      credenciamentoContato
    } = models;

    credenciamento.belongsTo(cidade, { foreignKey: 'cidadeId' });
    credenciamento.belongsTo(faturamentoCartao, { foreignKey: 'faturamentoCartaoId' });
    credenciamento.belongsTo(ramoAtividade, { foreignKey: 'ramoAtividadeCodigo' });
    credenciamento.belongsTo(taxaContratual, { foreignKey: 'taxaContratualId' });
    credenciamento.belongsTo(ticketMedio, { foreignKey: 'ticketMedioId' });
    credenciamento.belongsTo(participante, { foreignKey: 'participanteId' });

    credenciamento.hasMany(credenciamentoAprovacao, { as: 'historicoAprovacao', foreignKey: 'credenciamentoId' });
    credenciamento.hasMany(credenciamentoCaptura, { as: 'capturas', foreignKey: 'credenciamentoId' });
    credenciamento.hasMany(
      credenciamentoDomicilioBancario,
      { as: 'domiciliosBancarios', foreignKey: 'credenciamentoId' }
    );
    credenciamento.hasMany(
      credenciamentoTaxaAdministrativa,
      { as: 'taxasAdministrativas', foreignKey: { field: 'credenciamentoId', allowNull: false } }
    );
    credenciamento.hasMany(
      credenciamentoTaxaDebito,
      { as: 'taxasDebito', foreignKey: { field: 'credenciamentoId', allowNull: false } }
    );
    credenciamento.hasMany(credenciamentoSocio, { as: 'socios', foreignKey: 'credenciamentoId' });

    credenciamento.hasOne(credenciamentoInstalacao, { as: 'instalacao', foreignKey: 'credenciamentoId' });
    credenciamento.hasOne(credenciamentoContato, { as: 'contato', foreignKey: 'credenciamentoId' });
  };

  return credenciamento;
};

export default credenciamentoModel;
