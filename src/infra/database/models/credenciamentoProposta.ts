// tslint:disable:no-invalid-this
// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import tiposPessoa from '../../../domain/entities/tiposPessoa';
import { credenciamentoArquivosSchemas } from './credenciamento';
import validator from '../validator';
import { InvalidSentDataException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const schemas = credenciamentoArquivosSchemas();
const credenciamentoPropostaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const credenciamentoProposta = sequelize.define(
    'credenciamentoProposta',
    {
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
      arquivos: {
        type: dataTypes.JSONB
      },
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
    },
    {
      validate: {
        verificarArquivos() {
          if (+this.tipoPessoa === tiposPessoa.fisica) {
            if (!validator.check(schemas.pessoaFisica(true), this.arquivos)) {
              throw new InvalidSentDataException();
            }
          }

          if (+this.tipoPessoa === tiposPessoa.juridica) {
            if (!validator.check(schemas.pessoaJuridica(true), this.arquivos)) {
              throw new InvalidSentDataException();
            }
          }
        }
      }
    }
  );

  credenciamentoProposta.associate = (models) => {
    const { participante } = models;

    credenciamentoProposta.belongsTo(participante, { foreignKey: 'participanteId' });
  };

  return credenciamentoProposta;
};

export default credenciamentoPropostaModel;
