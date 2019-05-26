import { Sequelize } from 'sequelize-database';
import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';

const findAccreditationParticipantUseCase = (
  db: Sequelize
) =>

  /**
   * Irá encontrar o participante que possui esse credenciamento
   * Caso o credenciamento em questão esteja inativo será estourado uma exception de NotFound
   * Retorna em um objeto o (participanteExistente) e o credenciamento relacionado (credenciamentoAnterior)
   *
   * @param credenciamentoId O id do credenciamento que está sendo editado
   */
  async (// tslint:disable-next-line:ter-arrow-parens
    credenciamentoId: number
  ) => {

    const participante = await db.entities.participante.findOne({
      include: [{
        model: db.entities.participanteContato,
        as: 'contatos',
        required: false,
        where: { ativo: true }
      }, {
        model: db.entities.participanteDomicilioBancario,
        as: 'domiciliosBancarios'
      }, {
        model: db.entities.participanteTaxa,
        as: 'taxas'
      }, {
        model: db.entities.credenciamento,
        as: 'credenciamentos',
        required: true,
        where: {
          id: credenciamentoId,
          ativo: true
        },
        include: [{
          model: db.entities.credenciamentoTaxaAdministrativa,
          as: 'taxasAdministrativas'
        }, {
          model: db.entities.credenciamentoTaxaDebito,
          as: 'taxasDebito'
        }]
      }]
    });

    if (!participante) {
      throw new Exceptions.ParticipanteNotFoundException();
    }

    if ((participante.credenciamentos || []).length === 0) {
      throw new Exceptions.AccreditationNotFoundException();
    }

    return {
      participanteExistente: participante,
      credenciamentoAnterior: participante.credenciamentos[0]
    };

  };

export default findAccreditationParticipantUseCase;
