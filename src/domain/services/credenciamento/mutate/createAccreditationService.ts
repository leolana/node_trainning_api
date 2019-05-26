import { Sequelize } from 'sequelize-database';
import { Transaction } from 'sequelize';

import personTypeEnum from '../../participante/personTypeEnum';

const createAccreditationService = (
  db: Sequelize
) =>

  /**
   * Inclui o objeto da model de credenciamento no postgres.
   *
   * @param credenciamento O objeto model de credenciamento com os dados prontos para serem salvos.
   * @param transaction O objeto de transação do postgres.
   */
  async (
    credenciamento: any,
    transaction: Transaction = null
  ) => {

    const includes = [{
      model: db.entities.credenciamentoDomicilioBancario,
      as: 'domiciliosBancarios'
    }, {
      model: db.entities.credenciamentoCaptura,
      as: 'capturas'
    }, {
      model: db.entities.credenciamentoInstalacao,
      as: 'instalacao'
    }, {
      model: db.entities.credenciamentoTaxaAdministrativa,
      as: 'taxasAdministrativas'
    }, {
      model: db.entities.credenciamentoTaxaDebito,
      as: 'taxasDebito'
    }, {
      model: db.entities.credenciamentoAprovacao,
      as: 'historicoAprovacao'
    }, {
      model: db.entities.credenciamentoContato,
      as: 'contato'
    }];

    if (+credenciamento.tipoPessoa === personTypeEnum.juridica) {
      includes.push({
        model: db.entities.credenciamentoSocio,
        as: 'socios'
      });
    }

    return await db.entities.credenciamento.create(
      credenciamento,
      {
        transaction,
        include: includes,
        returning: true
      }
    );
  };

export default createAccreditationService;
