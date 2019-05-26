import { Sequelize } from 'sequelize-database';
import { Transaction } from 'sequelize';
import rateTypeEnum from '../../../services/participante/rateTypeEnum';

const updateParticipantRateUseCase = (
  db: Sequelize
) =>

  /**
   * Caso a taxa de antecipação tenha sido alterada: 1. Salva no histórico a
   * taxa antiga. 2. Exclui a taxa antiga do participante. 3. Cria uma nova taxa para o participante.
   *
   * Deixa o valor salvo em (credenciamento.taxaContratual.antecipacao).
   *
   * @param idParticipanteExistente O id do participante vinculado no credenciamento.
   * @param credenciamento O objeto da model de credenciamento onde será posto o novo valor da taxa.
   * @param newRate O objeto de taxa vindo do step wizard do front que contém a (antecipacao).
   * @param transaction A transação do postgres onde está sendo criado/editado o credenciamento.
   */
  async (
    idParticipanteExistente: number,
    credenciamento: any,
    newRate: any,
    userEmail: string,
    transaction: Transaction
  ) => {

    const rates = await db.entities.participanteTaxa.findAll({
      where: {
        participanteId: idParticipanteExistente,
        participanteTaxaTipo: rateTypeEnum.antecipacao,
      },
    });

    // Por enquanto somente um valor de antecipação é cadastrado
    const modified = rates.some(rate => rate.taxa !== newRate.antecipacao);
    if (!modified) {
      return;
    }

    await db.entities.participanteTaxaHistorico.bulkCreate(
      rates.map(r => ({
        usuarioCriacao: userEmail,
        participanteTaxaId: r.id,
        valorInicio: r.valorInicio,
        valorFim: r.valorFim,
        taxa: r.taxa,
        participanteId: r.participanteId,
        dataInclusao: r.createdAt,
        participanteTaxaTipo: r.participanteTaxaTipo,
      })),
      { transaction }
    );

    await db.entities.participanteTaxa.destroy({
      transaction,
      where: {
        participanteId: idParticipanteExistente,
        participanteTaxaTipo: rateTypeEnum.antecipacao,
      },
    });

    const newRateModel = {
      valorInicio: null,
      valorFim: null,
      taxa: newRate.antecipacao,
      participanteId: idParticipanteExistente,
      usuarioCriacao: userEmail,
      participanteTaxaTipo: rateTypeEnum.antecipacao,
    };

    await db.entities.participanteTaxa.create(newRateModel, { transaction });

    credenciamento.taxaContratual.antecipacao = newRate.antecipacao;
  };

export default updateParticipantRateUseCase;
