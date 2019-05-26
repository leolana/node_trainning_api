import { Sequelize } from 'sequelize-database';
import { Transaction } from 'sequelize';
import personTypeEnum from '../../participante/personTypeEnum';

const updateParticipantForApprovalService = (
  db: Sequelize
) =>

  /**
   * Seta o (participanteId) nas associações do (participanteNovo), atualiza o (participanteNovo) no postgres.
   * Apaga as associações anteriores (participanteContato), (participanteSocio), e (participanteDomicilioBancario)
   * e cria novamente com o novo (participanteId).
   *
   * @param participanteNovo Objeto da model de participante com dados novos pegos do objeto da model de credenciamento.
   * @param transaction Transação aberta do postgres
   */
  async (
    participanteNovo: any,
    transaction: Transaction
  ) => {

    participanteNovo.contatos.forEach((contato: any) => {
      contato.participanteId = participanteNovo.id;
    });

    participanteNovo.socios.forEach((socio: any) => {
      socio.participanteId = participanteNovo.id;
    });

    participanteNovo.domiciliosBancarios.forEach((domicilioBancario: any) => {
      domicilioBancario.participanteId = participanteNovo.id;
    });

    await db.entities.participante.update(
      participanteNovo,
      {
        transaction,
        where: { id: participanteNovo.id }
      }
    );

    await Promise.all([
      db.entities.participanteContato.destroy({
        transaction,
        where: { participanteId: participanteNovo.id },
      }),

      db.entities.participanteSocio.destroy({
        transaction,
        where: { participanteId: participanteNovo.id },
      }),

      db.entities.participanteDomicilioBancario.destroy({
        transaction,
        where: { participanteId: participanteNovo.id },
      }),

      db.entities.participanteContato.bulkCreate(
        participanteNovo.contatos,
        { transaction },
      ),

      db.entities.participanteDomicilioBancario.bulkCreate(
        participanteNovo.domiciliosBancarios,
        { transaction },
      )
    ]);

    if (+participanteNovo.tipoPessoa === personTypeEnum.juridica) {
      await db.entities.participanteSocio.bulkCreate(
        participanteNovo.socios,
        { transaction },
      );
    }
  };

export default updateParticipantForApprovalService;
