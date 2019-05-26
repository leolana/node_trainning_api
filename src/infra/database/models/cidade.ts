// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

export const estados = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins'
};

const cidadeModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const cidade = sequelize.define(
    'cidade',
    {
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      estado: {
        type: dataTypes.STRING(2),
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.keys(estados)]
        }
      }
    }
  );

  return cidade;
};

export default cidadeModel;
