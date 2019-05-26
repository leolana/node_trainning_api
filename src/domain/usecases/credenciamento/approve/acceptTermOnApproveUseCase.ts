import { Sequelize } from 'sequelize-database';
import { Transaction } from 'sequelize';
import { DateTime } from 'luxon';
import termoTypeEnum from '../../../services/termo/termoTypeEnum';
import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';

const acceptTermOnApproveUseCase = (
  db: Sequelize
) =>

  /**
   * Busca o termo vigente do tipo (contratoMaeEstabelecimento) e cria a relação (participanteAceiteTermo)
   */
  async (
    credenciamentoParticipanteId: number,
    userEmail: string,
    transaction: Transaction
  ) => {

    const now = DateTime.local();

    const term = await db.entities.termo.findOne({
      transaction,
      where: {
        inicio: { $lte: now.toSQLDate() },
        fim: {
          $or: {
            $eq: null,
            $gte: now.toSQLDate(),
          },
        },
        tipo: termoTypeEnum.contratoMaeEstabelecimento,
      },
      attributes: ['id'],
    });

    if (!term) {
      throw new Exceptions.TermNotFoundException();
    }

    const aceite = {
      participanteId: credenciamentoParticipanteId,
      termoId: term.id,
      usuario: userEmail,
    };

    await db.entities.participanteAceiteTermo.create(aceite, { transaction });
  };

export default acceptTermOnApproveUseCase;
