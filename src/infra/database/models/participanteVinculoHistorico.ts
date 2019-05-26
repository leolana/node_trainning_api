// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';

const participanteVinculoHistoricoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const participanteVinculoHistorico = sequelize.define(
    'participanteVinculoHistorico',
    {
      participanteEstabelecimentoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      participanteFornecedorId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: true
      },
      status: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        defaultValue: participanteVinculoStatus.pendente,
        validate: {
          isIn: [<any[]>Object.values(participanteVinculoStatus)]
        }
      },
      exibeValorDisponivel: {
        type: dataTypes.BOOLEAN,
        allowNull: false
      },
      diasAprovacao: {
        type: dataTypes.SMALLINT,
        allowNull: false,
      },
      dataRespostaEstabelecimento: {
        type: dataTypes.DATE,
        allowNull: true
      },
      usuarioRespostaEstabelecimento: {
        type: dataTypes.STRING(100),
        allowNull: true
      },
      valorMaximoExibicao: {
        type: dataTypes.FLOAT,
        allowNull: true,
      },
    }
  );

  return participanteVinculoHistorico;
};

export default participanteVinculoHistoricoModel;
