import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-database';

const inactivatePreviousAccreditationUseCase = (
  db: Sequelize
) =>

  /**
   * Inativa o credenciamento anterior que está vinculado ao (participanteExistenteId)
   */
  async (
    participanteExistenteId: number,
    credenciamentoAnterior: any,
    userEmail: string,
    transaction: Transaction
  ) => {

    await Promise.all([
      credenciamentoAnterior.update(
        { ativo: false },
        { transaction }
      ),
      db.entities.participanteAceiteTermo.update(
        { usuario: userEmail },
        {
          transaction,
          where: {
            participanteId: participanteExistenteId
          }
        }
      )
    ]);

  };

export default inactivatePreviousAccreditationUseCase;
