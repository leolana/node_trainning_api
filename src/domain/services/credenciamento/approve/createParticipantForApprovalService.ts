import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-database';
import personTypeEnum from '../../participante/personTypeEnum';

const createParticipantForApprovalService = (
  db: Sequelize
) =>

  /**
   * Usando o objeto (participanteNovo) que já tem as associações (participanteDomicilioBancario),
   * (participanteContato), (participanteTaxa), e (participanteSocio) cria o participante no postgres
   * e retorna o objeto da model criada.
   *
   * @param participanteNovo Objeto da model de participante com dados novos pegos do objeto da model de credenciamento.
   * @param transaction Transação aberta do postgres
   */
  async (
    participanteNovo: any,
    transaction: Transaction
  ) => {

    const includes = [{
      model: db.entities.participanteDomicilioBancario,
      as: 'domiciliosBancarios',
    }, {
      model: db.entities.participanteContato,
      as: 'contatos',
    }, {
      model: db.entities.participanteTaxa,
      as: 'taxas',
    }];

    if (+participanteNovo.tipoPessoa === personTypeEnum.juridica) {
      includes.push({
        model: db.entities.participanteSocio,
        as: 'socios'
      });
    }

    return await db.entities.participante.create(participanteNovo, {
      transaction,
      include: includes,
    });
  };

export default createParticipantForApprovalService;
