// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import { rolesEnum } from '../../../domain/services/auth/rolesEnum';

const usuarioModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const roles = Object.values(rolesEnum);

  const usuario = sequelize.define(
    'usuario',
    {
      id: {
        type: dataTypes.UUID,
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
            if (value.some((v: any) => !roles.includes(v))) throw new Error('invalid-sent-data');
          }
        }
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    },
  );

  usuario.associate = (models) => {
    const { membro } = models;
    usuario.hasMany(membro, { as: 'associacoes', foreignKey: 'usuarioId' });
  };

  return usuario;
};

export default usuarioModel;
