import dataFaker from '../../dataFaker';
import participanteVinculoStatus from '../../../../src/domain/entities/participanteVinculoStatus';

const participanteVinculoFactory = (factory) => {
  return factory.define('participanteVinculo', {
    participanteEstabelecimentoId: 1,
    participanteFornecedorId: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    status: participanteVinculoStatus.reprovado,
    exibeValorDisponivel: dataFaker.bool(),
    diasAprovacao: dataFaker.integer(),
    dataRespostaEstabelecimento: dataFaker.date(),
    usuarioRespostaEstabelecimento: dataFaker.string({ length: 100 }),
    estabelecimentoSolicitouVinculo: dataFaker.bool(),
    valorMaximoExibicao: dataFaker.floating({ min: 1, max: 10000, fixed: 2 }),
    motivoTipoRecusaId: dataFaker.integer(),
    motivoRecusaObservacao: dataFaker.string({ length: 500 }),
  });
};

export default participanteVinculoFactory;
