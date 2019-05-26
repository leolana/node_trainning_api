import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-database';

const approveCreateEstablishmentService = (
  db: Sequelize
) =>

  /**
   * No fluxo onde não existe o (participanteExistente), ou seja, na aprovação do credenciamento em análise,
   * é criado o registro (participanteEstabelecimento) para que o (participanteNovo) se torne um estabelecimento.
   *
   * @param participanteNovo Objeto da model de participante com dados novos pegos do objeto da model de credenciamento.
   * @param participanteExistente Se for o fluxo de aprovação de um credenciamento em análise então terá valor null.
   * Se for o fluxo da edição de um credenciamento já aprovado então será a model do participante já existente.
   * @param transaction Transação aberta do postgres.
   */
  async (
    participanteNovo: any,
    participanteExistente: any,
    transaction: Transaction
  ) => {

    if (participanteExistente) {
      participanteNovo.isAlteracao = true;
      return;
    }

    await db.entities.participanteEstabelecimento.create(
      { participanteId: participanteNovo.id },
      { transaction }
    );

  };

export default approveCreateEstablishmentService;
