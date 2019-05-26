// tslint:disable:no-magic-numbers
// tslint:disable:no-invalid-this
import { Sequelize, DataTypes } from 'sequelize-database';

import tiposPessoa from '../../../domain/entities/tiposPessoa';

const participanteModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participante = sequelize.define(
    'participante',
    {
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
      },
    },
    {
      validate: {
        verificarDadosPessoa() {
          if (+this.tipoPessoa === tiposPessoa.juridica) {
            if (!this.razaoSocial || !this.inscricaoEstadual || !this.inscricaoMunicipal) {
              throw new Error('documentos-validation-error');
            }
          }
        },
        verificarParticipacoes() {
          if (this.socios) {
            if (this.socios > 100) {
              throw new Error('invalid-sent-data');
            }
          }
        }
      }
    }
  );

  participante.associate = (models) => {
    const {
      cidade,
      ramoAtividade,
      credenciamento,
      participanteContato,
      participanteSocio,
      participanteIndicacao,
      participanteDomicilioBancario,
      participanteIntegracao,
      antecipacao,
      membro,
      participanteExportacao,
      participanteTaxa,
      participanteTaxaHistorico,
    } = models;

    participante.belongsTo(cidade, { foreignKey: 'cidadeId' });
    participante.belongsTo(ramoAtividade, { foreignKey: 'ramoAtividadeCodigo' });

    participante.hasMany(participanteExportacao, {
      as: 'exportacoes',
      foreignKey: 'participanteId',
    });
    participante.hasMany(credenciamento, { as: 'credenciamentos', foreignKey: 'participanteId' });
    participante.hasMany(participanteContato, { as: 'contatos', foreignKey: 'participanteId' });
    participante.hasMany(participanteSocio, { as: 'socios', foreignKey: 'participanteId' });
    participante.hasMany(participanteIndicacao, { as: 'indicacoes', foreignKey: 'participanteId' });
    participante.hasMany(participanteDomicilioBancario, { as: 'domiciliosBancarios', foreignKey: 'participanteId' });
    participante.hasMany(participanteIntegracao, { as: 'integracoes', foreignKey: 'participanteId' });
    participante.hasMany(antecipacao, { as: 'antecipacoes', foreignKey: 'participanteId' });
    participante.hasMany(membro, { as: 'membros', foreignKey: 'participanteId' });
    participante.hasMany(participanteTaxa, { as: 'taxas', foreignKey: 'participanteId' });
    participante.hasMany(
      participanteTaxaHistorico,
      { as: 'taxasHistorico', foreignKey: 'participanteId', constraints: false }
    );

  };

  return participante;
};

export default participanteModel;
