import database from '../../../../support/database';
import getProviderBondsUseCase from '../../../../../src/domain/usecases/participante/getProviderBondsUseCase';
import participanteVinculoStatus from '../../../../../src/domain/entities/participanteVinculoStatus';

describe('Domain :: UseCases :: Participante :: getProviderBonds', () => {
  const siscofWrapper: any = { incluirExcluirCessionarioEC: () => ({}) };
  const getProviderBonds = getProviderBondsUseCase(database, siscofWrapper);
  const email = 'alpe@alpe.com.br';

  test('Successfully get vinculos from approved provider', async (done) => {
    try {
      const id = 1;
      const estabelecimentoId = 1;
      const novoStatus = +participanteVinculoStatus.aprovado;
      const vinculo = await getProviderBonds(
        id,
        estabelecimentoId,
        novoStatus,
        email
      );

      const vinculoHistorico = await database.entities.participanteVinculoHistorico.findOne({
        where: {
          participanteEstabelecimentoId: vinculo.participanteEstabelecimentoId,
          participanteFornecedorId: vinculo.participanteFornecedorId,
          status: vinculo.status,
          exibeValorDisponivel: vinculo.exibeValorDisponivel,
          diasAprovacao: vinculo.diasAprovacao,
          dataRespostaEstabelecimento: vinculo.dataRespostaEstabelecimento,
          usuarioRespostaEstabelecimento: vinculo.usuarioRespostaEstabelecimento,

        }
      });

      expect(vinculo).toBeTruthy();
      expect(vinculo.usuarioRespostaEstabelecimento).toBe(email);
      expect(vinculo.participanteEstabelecimentoId).toBe(vinculoHistorico.participanteEstabelecimentoId);
      expect(vinculo.participanteFornecedorId).toBe(vinculoHistorico.participanteFornecedorId);
      expect(vinculo.status).toBe(vinculoHistorico.status);
      expect(vinculo.exibeValorDisponivel).toBe(vinculoHistorico.exibeValorDisponivel);
      expect(vinculo.diasAprovacao).toBe(vinculoHistorico.diasAprovacao);
      expect(vinculo.dataRespostaEstabelecimento).toBe(vinculoHistorico.dataRespostaEstabelecimento);
      expect(vinculo.usuarioRespostaEstabelecimento).toBe(vinculoHistorico.usuarioRespostaEstabelecimento);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }

  });

  test('Successfully get vinculos from reproved provider', async (done) => {
    try {
      const id = 1;
      const estabelecimentoId = 1;
      const novoStatus = +participanteVinculoStatus.reprovado;
      const motivoTipoRecusaId = 2;
      const observacao = 'texto de observacao';
      const vinculo = await getProviderBonds(
        id,
        estabelecimentoId,
        novoStatus,
        email,
        motivoTipoRecusaId,
        observacao
      );

      const vinculoHistorico = await database.entities.participanteVinculoHistorico.findOne({
        where: {
          participanteEstabelecimentoId: vinculo.participanteEstabelecimentoId,
          participanteFornecedorId: vinculo.participanteFornecedorId,
          status: vinculo.status,
          exibeValorDisponivel: vinculo.exibeValorDisponivel,
          diasAprovacao: vinculo.diasAprovacao,
          dataRespostaEstabelecimento: vinculo.dataRespostaEstabelecimento,
          usuarioRespostaEstabelecimento: vinculo.usuarioRespostaEstabelecimento,
        }
      });

      expect(vinculo).toBeTruthy();
      expect(vinculo.usuarioRespostaEstabelecimento).toBe(email);
      expect(vinculo.participanteEstabelecimentoId).toBe(vinculoHistorico.participanteEstabelecimentoId);
      expect(vinculo.participanteFornecedorId).toBe(vinculoHistorico.participanteFornecedorId);
      expect(vinculo.status).toBe(vinculoHistorico.status);
      expect(vinculo.exibeValorDisponivel).toBe(vinculoHistorico.exibeValorDisponivel);
      expect(vinculo.diasAprovacao).toBe(vinculoHistorico.diasAprovacao);
      expect(vinculo.dataRespostaEstabelecimento).toBe(vinculoHistorico.dataRespostaEstabelecimento);
      expect(vinculo.usuarioRespostaEstabelecimento).toBe(vinculoHistorico.usuarioRespostaEstabelecimento);
      expect(vinculo.motivoTipoRecusaId).toBe(motivoTipoRecusaId);
      expect(vinculo.motivoRecusaObservacao).toBe(observacao);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }

  });

  test('Try to get vinculos from provider', async (done) => {
    try {
      database.entities.participanteVinculo.findOne = () => null;
      const id = 1;
      const estabelecimentoId = 1;
      const novoStatus = +participanteVinculoStatus.reprovado;
      const motivoTipoRecusaId = 2;
      await getProviderBonds(
        id,
        estabelecimentoId,
        novoStatus,
        email,
        motivoTipoRecusaId
      );
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('vinculo-nao-encontrado');
    }
    done();
  });

});
