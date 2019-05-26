// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import { rolesEnum } from '../../../domain/services/auth/rolesEnum';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const usuarioConviteModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const roles = Object.values(rolesEnum);

  const usuarioConvite = sequelize.define(
    'usuarioConvite',
    {
      codigo: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV1,
        primaryKey: true
      },
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      celular: {
        type: dataTypes.STRING(11),
        allowNull: false
      },
      roles: {
        type: dataTypes.ARRAY(dataTypes.STRING(50)),
        allowNull: false,
        validate: {
          areKnownRoles: (value) => {
            if (value.some(v => !roles.includes(v))) {
              throw new Exceptions.InvalidSentDataException();
            }
          }
        }
      },
      convidadoPor: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      participante: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      expiraEm: {
        type: dataTypes.DATE,
        allowNull: false
      }
    }
  );

  return usuarioConvite;
};

export default usuarioConviteModel;
