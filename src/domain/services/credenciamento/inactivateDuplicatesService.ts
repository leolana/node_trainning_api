import { Sequelize } from 'sequelize-database';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const inactivateDuplicatesService = (db: Sequelize) =>
  (credenciamentoId: number, documento: string, transaction: any) => {
    if (!credenciamentoId) {
      throw new Exceptions.MissingAccreditationIdException();
    }

    if (!documento) {
      throw new Exceptions.MissingDocumentException();
    }

    const find = () => {
      return db.entities.credenciamento.findAll({
        where: {
          documento,
          ativo: true,
          id: { $not: credenciamentoId }
        },
        attributes: ['id', 'createdAt'],
      });
    };

    const inactivate = (credenciamentos: any[]) => {
      const promises = credenciamentos.map((credenciamento: any) => {
        credenciamento.ativo = false;
        return credenciamento.save({ transaction });
      });

      return Promise.all(promises);
    };

    return find().then(inactivate);
  };

export default inactivateDuplicatesService;
