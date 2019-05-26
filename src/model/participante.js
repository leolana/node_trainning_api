const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide('@participante.entities', '@@tipos-pessoa', (tiposPessoa) => {
    const _tiposPessoa = [];

    Object.keys(tiposPessoa).forEach((key) => {
      _tiposPessoa.push(tiposPessoa[key]);
    });

    return Promise.resolve({
      identity: 'participante',
      attributes: {
        tipoPessoa: {
          type: Sequelize.SMALLINT,
          allowNull: false,
          isIn: [_tiposPessoa],
        },
        ramoAtividadeCodigo: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        documento: {
          type: Sequelize.STRING(18),
          allowNull: false,
        },
        nome: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        aberturaNascimento: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        telefone: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        cep: {
          type: Sequelize.STRING(8),
          allowNull: false,
        },
        logradouro: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        numero: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        complemento: {
          type: Sequelize.STRING(50),
        },
        bairro: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        cidadeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        nomeMae: {
          type: Sequelize.STRING(100),
        },
        razaoSocial: {
          type: Sequelize.STRING(100),
        },
        inscricaoEstadual: {
          type: Sequelize.STRING(15),
        },
        inscricaoMunicipal: {
          type: Sequelize.STRING(15),
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        usuario: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        arquivos: {
          type: Sequelize.JSONB,
        },
      },
      associations: {
        belongsTo: {
          cidade: { sourceKey: 'cidadeId' },
          ramoAtividade: { sourceKey: 'ramoAtividadeCodigo' },
        },
        hasMany: {
          credenciamento: {
            as: 'credenciamentos',
            foreignKey: 'participanteId',
          },
          participanteContato: {
            as: 'contatos',
            foreignKey: 'participanteId',
          },
          participanteSocio: {
            as: 'socios',
            foreignKey: 'participanteId',
          },
          participanteIndicacao: {
            as: 'indicacoes',
            foreignKey: 'participanteId',
          },
          participanteDomicilioBancario: {
            as: 'domiciliosBancarios',
            foreignKey: 'participanteId',
          },
          participanteExportacao: {
            as: 'exportacoes',
            foreignKey: 'participanteId',
          },
          antecipacao: {
            as: 'antecipacoes',
            foreignKey: 'participanteId',
          },
          membro: {
            as: 'membros',
            foreignKey: 'participanteId',
          },
          participanteTaxa: {
            as: 'taxas',
            foreignKey: 'participanteId',
          },
          participanteTaxaHistorico: {
            as: 'taxasHistorico',
            foreignKey: 'participanteTaxaId',
            constraints: false,
          },
        },
      },
      validations: {
        verificarDadosPessoa() {
          if (+this.tipoPessoa === tiposPessoa.fisica && !this.nomeMae) {
            throw String('tipo-pessoa-validation-error');
          }

          if (+this.tipoPessoa === tiposPessoa.juridica) {
            if (!this.razaoSocial
              || !this.inscricaoEstadual
              || !this.inscricaoMunicipal
            ) {
              throw String('documentos-validation-error');
            }
          }
        },
        verificarParticipacoes() {
          if (this.socios) {
            const sum = this.socios.reduce((prev, curr) => prev + curr, 0);
            if (this.socios > 100) {
              throw 'invalid-sent-data';
            }
          }
        },
      },
    });
  });
};
