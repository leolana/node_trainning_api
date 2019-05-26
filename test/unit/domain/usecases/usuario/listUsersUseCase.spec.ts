import listUsersUseCase from '../../../../../src/domain/usecases/usuario/listUsersUseCase';
import database from '../../../../support/database';
import usuarioStatus from '../../../../../src/domain/entities/usuarioStatus';
import { DatatableInterface } from '../../../../../src/domain/services/datatable/getDatatableOptionsService';

describe('Domain :: UseCases :: Usuario :: ListUsers', () => {

  const listUsers = listUsersUseCase(database);

  test('happy path', async (done) => {

    database.entities.usuario.findAll = (): any => {
      return Promise.resolve([]);
    };

    database.entities.usuario.count = (): any => {
      return Promise.resolve([]);
    };

    const participanteId = 1;
    const filter = { status: usuarioStatus.ativo };
    const datatableOptions: DatatableInterface = { pageSize: 10, pageIndex: 0, sortColumn: '', sortOrder: 'asc' };

    const result = await listUsers(participanteId, filter, datatableOptions);
    expect(typeof result === 'object').toBe(true);

    done();
  });

});
