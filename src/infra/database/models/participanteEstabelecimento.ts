// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteEstabelecimentoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const participanteEstabelecimento = sequelize.define(
    'participanteEstabelecimento',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        primaryKey: true
      },
    }
  );

  participanteEstabelecimento.associate = (models) => {
    const { participante, participanteVinculo } = models;

    participanteEstabelecimento.belongsTo(participante, { foreignKey: 'participanteId' });
    participanteEstabelecimento.hasMany(
      participanteVinculo,
      { as: 'vinculos', foreignKey: 'participanteEstabelecimentoId' }
    );
  };

  return participanteEstabelecimento;
};

export default participanteEstabelecimentoModel;
