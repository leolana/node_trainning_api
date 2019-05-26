import * as uuid from 'uuid';

import database from '../../../../support/database';
import getIdFromDocumentUseCase from '../../../../../src/domain/usecases/credenciamento/getIdFromDocumentUseCase';

describe('Domain :: UseCases :: Account :: DeleteInvite', () => {
  test('Get Accreditation with document exist', async (done) => {
    const getIdFromDocument = getIdFromDocumentUseCase(database);
    const get = await getIdFromDocument('00000000000000');

    expect(typeof get === 'object').toBe(true);
    done();
  });

  test('Get Accreditation with document doesnt exist', async (done) => {
    database.entities.credenciamento.findOne = async () => {
      return null;
    };

    const getIdFromDocument = getIdFromDocumentUseCase(database);

    try {
      await getIdFromDocument(uuid.v1());
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message).toBe('registro-nao-encontrado');
    }

    done();
  });
});
