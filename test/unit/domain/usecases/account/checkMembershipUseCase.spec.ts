
import database from '../../../../support/database';
import checkMembershipsUseCase from '../../../../../src/domain/usecases/account/checkMembershipsUseCase';

describe('Domain :: UseCases :: Account :: checkMembershipsUseCase', () => {

  test('checkMembershipsUseCase from an empty array of emails', async (done) => {
    try {
      const emails = [];
      database.entities.usuario.findAll = async () => [];
      const checkMembership = checkMembershipsUseCase(database);
      const membros = await checkMembership(emails);
      expect(typeof membros === 'object').toBe(true);
    } catch (error) {
      expect(error).toBe(null);
    }
    done();
  });

  test('checkMembershipsUseCase from an array of emails', async (done) => {
    try {
      const emails = ['mail@mail'];
      const usuarios = [
        {
          id: '1',
          email: 'mail@mail',
          roles: [],
          associacoes: [{
            participanteId: '2',
            participante: {}
          }]
        }
      ];
      database.entities.usuario.findAll = async () => usuarios;
      const checkMembership = checkMembershipsUseCase(database);
      const conviteEMembros = await checkMembership(emails);
      expect(typeof conviteEMembros === 'object').toBe(true);
      expect(Array.isArray(conviteEMembros.convites)).toBe(true);
      expect(Array.isArray(conviteEMembros.memberships)).toBe(true);
    } catch (error) {
      expect(error).toBe(null);
    }
    done();
  });
});
