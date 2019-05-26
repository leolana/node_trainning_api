// tslint:disable:no-magic-numbers
// tslint:disable:no-invalid-this
import { Sequelize, DataTypes } from 'sequelize-database';

import tiposPessoa from '../../../domain/entities/tiposPessoa';
import { InvalidSentDataException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const participanteSocioModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteSocio = sequelize.define(
    'participanteSocio',
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
      email: {
        type: dataTypes.STRING(200),
        allowNull: false
      },
      telefone: {
        type: dataTypes.STRING(11),
        allowNull: false
      },
      participacao: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      celular: {
        type: dataTypes.STRING(11)
      },
      contato: {
        type: dataTypes.BOOLEAN
      },
      razaoSocial: {
        type: dataTypes.STRING(100)
      },
      inscricaoEstadual: {
        type: dataTypes.STRING(50)
      },
      inscricaoMunicipal: {
        type: dataTypes.STRING(50)
      }
    },
    {
      validate: {
        verificarDadosPessoa() {
          if (+this.tipoPessoa === tiposPessoa.fisica) {
            if (!this.celular
              || this.contato === null
              || typeof (this.contato) === 'undefined') {
              throw new InvalidSentDataException();
            }
          }

          if (+this.tipoPessoa === tiposPessoa.juridica) {
            if (!this.razaoSocial || !this.inscricaoEstadual || !this.inscricaoMunicipal) {
              throw new InvalidSentDataException();
            }
          }
        }
      }
    }
  );

  return participanteSocio;
};

export default participanteSocioModel;
